import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('GoodWasteBackend');
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS agar frontend Next.js dapat berinteraksi tanpa hambatan
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`🌿 GoodWaste Backend API berjalan di http://localhost:${port}`);
}

bootstrap();
