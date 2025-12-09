import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middlewares
  app.use(cookieParser());  // لقراءة الكوكيز
  app.use(helmet());        // هيدرات حماية أساسية

  // CORS: السماح لجميع الدومينات بالوصول
  app.enableCors({
    origin: '*',        // السماح للجميع بالوصول
    credentials: true,   // يسمح بإرسال الكوكيز (مثل refresh token)
  });

  // Render يمرر PORT في env
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
