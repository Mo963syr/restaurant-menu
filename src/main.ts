import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());          // لقراءة الكوكيز
  app.use(helmet());               // هيدر حماية (من ضمنها XSS protection بسيطة)

  app.enableCors({
    origin: ['http://localhost:3000'], // عدّلها على دومين الواجهة الأمامية
    credentials: true,                 // حتى يرسل المتصفح الكوكيز للـ API
  });

  await app.listen(3000);
}
bootstrap();
