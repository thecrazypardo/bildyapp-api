import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadLogo } from '../middleware/upload.js';
import {
  registerSchema,
  validateEmailSchema,
  loginSchema,
  personalDataSchema,
  companySchema,
  refreshTokenSchema,
  changePasswordSchema,
  inviteSchema,
  deleteUserSchema
} from '../validators/user.validator.js';

export const userRouter = Router();

// 1) Registro
userRouter.post('/register', validate(registerSchema), userController.register);

// 4a) Onboarding: datos personales (mismo path que registro, método PUT)
userRouter.put(
  '/register',
  authenticate,
  validate(personalDataSchema),
  userController.updatePersonalData
);

// 2) Validación de email
userRouter.put(
  '/validation',
  authenticate,
  validate(validateEmailSchema),
  userController.validateEmail
);

// 3) Login
userRouter.post('/login', validate(loginSchema), userController.login);

// 4b) Onboarding: compañía
userRouter.patch(
  '/company',
  authenticate,
  validate(companySchema),
  userController.updateCompany
);

// 5) Logo de la compañía
userRouter.patch('/logo', authenticate, uploadLogo, userController.updateLogo);

// 6) Obtener usuario autenticado
userRouter.get('/', authenticate, userController.getMe);

// 7) Sesión: refresh + logout
userRouter.post('/refresh', validate(refreshTokenSchema), userController.refresh);
userRouter.post('/logout', authenticate, userController.logout);

// 8) Eliminar usuario
userRouter.delete(
  '/',
  authenticate,
  validate(deleteUserSchema),
  userController.deleteUser
);

// 9) Cambiar contraseña
userRouter.put(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword
);

// 10) Invitar compañeros (solo admin)
userRouter.post(
  '/invite',
  authenticate,
  requireRole('admin'),
  validate(inviteSchema),
  userController.invite
);
