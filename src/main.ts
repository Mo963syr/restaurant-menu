import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // middlewares
  app.use(cookieParser());  // لقراءة الكوكيز
  app.use(helmet());        // هيدرات حماية أساسية

  // CORS
  // ضع في الـ env مثلاً:
  // ALLOWED_ORIGINS=http://localhost:3000,https://my-frontend.com
  const allowedOrigins =
    process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // ضروري للكوكيز (refresh token)
  });

  // Render يمرر PORT في env
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
