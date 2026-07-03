# BildyApp API — Gestión de Usuarios

API REST con Node.js 22 + Express 5 para el módulo de gestión de usuarios de **BildyApp**: registro, verificación de email, login, onboarding (datos personales y de compañía), subida de logo, gestión de sesión (JWT access + refresh), borrado de cuentas y sistema de invitaciones con roles.

## Tecnologías

- Node.js 22 (ESM, `--watch`, `--env-file`)
- Express 5
- MongoDB Atlas + Mongoose (MVC, populate, virtuals, indexes)
- Zod (validación, `.transform()`, `.refine()`, `discriminatedUnion`)
- JWT (`jsonwebtoken`) + `bcryptjs`
- Multer (subida de logo)
- Helmet, `express-rate-limit`, `express-mongo-sanitize`
- `EventEmitter` nativo para eventos del ciclo de vida del usuario

## Estructura del proyecto

```
src/
├── config/            # Configuración centralizada (lee variables de entorno)
├── controllers/        # Lógica de negocio de cada endpoint
├── middleware/         # auth, validate, roles, upload, error-handler
├── models/             # User.js, Company.js (Mongoose)
├── routes/             # user.routes.js
├── services/            # notification.service.js (EventEmitter)
├── utils/               # AppError.js
├── validators/           # Esquemas Zod
├── app.js               # Configuración de Express
└── index.js              # Punto de entrada / conexión a Mongo
uploads/                  # Logos subidos con Multer
requests.http             # Colección de ejemplos de peticiones
```

## Instalación

1. Clona el repositorio e instala las dependencias:

   ```bash
   npm install
   ```

2. Copia el fichero de variables de entorno de ejemplo y rellénalo con tus valores (URI de MongoDB Atlas, secretos JWT, etc.):

   ```bash
   cp .env.example .env
   ```

3. Arranca el servidor en modo desarrollo (usa `node --watch` y recarga automáticamente):

   ```bash
   npm run dev
   ```

   O en modo producción:

   ```bash
   npm start
   ```

4. Comprueba que el servidor está vivo:

   ```bash
   curl http://localhost:3000/health
   ```

## Uso de la API

Consulta el fichero [`requests.http`](./requests.http) para ver un ejemplo de cada endpoint (compatible con la extensión REST Client de VS Code o Thunder Client). Flujo típico:

1. `POST /api/user/register` → crea el usuario y devuelve `accessToken` + `refreshToken`.
2. `PUT /api/user/validation` → verifica el email con el código de 6 dígitos (consultar en base de datos mientras no haya envío real de correo).
3. `PUT /api/user/register` → completa nombre, apellidos y NIF.
4. `PATCH /api/user/company` → crea o une el usuario a una compañía según el CIF (o marca `isFreelance: true`).
5. `PATCH /api/user/logo` → sube el logo de la compañía (`multipart/form-data`, campo `logo`).
6. `GET /api/user` → obtiene el usuario autenticado con la compañía populada.
7. `POST /api/user/refresh` / `POST /api/user/logout` → gestión de sesión.
8. `PUT /api/user/password` → cambio de contraseña.
9. `POST /api/user/invite` → solo `admin`, invita a un compañero a la misma compañía.
10. `DELETE /api/user?soft=true` → borrado lógico (o sin el parámetro, borrado físico).

## Eventos

El servicio `src/services/notification.service.js` emite los siguientes eventos, registrados con listeners que hacen `console.log` (en la práctica final se enviarán a Slack):

- `user:registered`
- `user:verified`
- `user:invited`
- `user:deleted`

## Notas de diseño

- El **soft delete** se implementa excluyendo automáticamente los documentos con `deleted: true` en los hooks `pre(/^find/)` de los modelos `User` y `Company`.
- El **refresh token** se persiste en el documento del usuario (campo `refreshToken`, `select: false`) y se rota en cada llamada a `/refresh`; el logout lo invalida poniéndolo a `null`.
- La validación de la compañía usa `z.discriminatedUnion('isFreelance', [...])` para exigir `name`/`cif` solo cuando el usuario **no** es autónomo.
- El middleware `error-handler.js` centraliza la respuesta de errores `AppError`, errores de Multer y duplicados de MongoDB (código `11000`).
