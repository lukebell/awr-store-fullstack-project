import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from 'src/modules/app/app.module';
import packageJson from '../package.json';
import { GenericOperationResponse } from './common/schemas/generic-operation-response.schema';

patchNestJsSwagger();

async function bootstrap() {
  // Create the adapter first
  const adapter = new FastifyAdapter();

  // Enable CORS directly on the Fastify adapter (this registers @fastify/cors internally)
  adapter.enableCors({
    origin: true, // Mirrors the request origin (works with credentials)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Add any custom headers you're sending
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(packageJson.name)
    .build();
  const swaggerDocumentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig, {
      extraModels: [GenericOperationResponse],
    });
  SwaggerModule.setup('api', app, swaggerDocumentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
