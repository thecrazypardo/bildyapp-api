import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/index.js';

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Conectado a MongoDB Atlas');

    app.listen(config.port, () => {
      console.log(`🚀 BildyApp API escuchando en http://localhost:${config.port} (${config.env})`);
    });
  } catch (err) {
    console.error('❌ Error al arrancar el servidor:', err);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
