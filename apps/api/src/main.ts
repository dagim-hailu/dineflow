import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { augmentOpenApiWithGraphql } from './docs/augment-openapi-graphql';

function parseCorsOrigins(): string | boolean | string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL;
  if (!raw) {
    return [
      'http://localhost',
      'http://localhost:80',
      'http://localhost:3000',
      'http://127.0.0.1',
      'http://127.0.0.1:80',
      'http://127.0.0.1:3000',
    ];
  }
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return true;
  const merged = list.length === 1 ? [list[0]!] : [...list];
  const extras = [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    'http://127.0.0.1:3000',
  ];
  for (const o of extras) {
    if (!merged.includes(o)) merged.push(o);
  }
  return merged;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.use(cookieParser());

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const port = Number(process.env.PORT ?? 3001);
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DineFlow API')
      .setDescription(
        'OpenAPI surface: **GET /health** and **POST /graphql**. Primary API is GraphQL; use Swagger examples or GraphQL Playground.',
      )
      .setVersion('2.1')
      .addServer(`http://localhost:${port}`, 'Direct (host → published API port)')
      .addServer('http://localhost/graphql', 'Docker stack: via Nginx')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    augmentOpenApiWithGraphql(document);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'DineFlow API',
    });
  }

  await app.listen(process.env.PORT ?? 3001);
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
  if (process.env.SWAGGER_ENABLED !== 'false') {
    console.log(`Swagger UI: ${url}/api/docs`);
  }
}
bootstrap();
