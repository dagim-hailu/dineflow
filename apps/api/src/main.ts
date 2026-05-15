import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { augmentOpenApiWithGraphql } from './docs/augment-openapi-graphql';

function parseCorsOrigins(): string | boolean | string[] {
  const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL;
  console.log('CORS Debug: raw environment value:', raw);

  if (!raw) {
    return [
      'http://localhost',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
  }

  // Split, trim, and remove trailing slashes for exact origin matching
  const list = raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (list.length === 0) return true;

  const merged = [...list];
  const extras = [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  for (const o of extras) {
    if (!merged.includes(o)) merged.push(o);
  }

  console.log('CORS Debug: Final allowed origins:', merged);
  return merged;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Requested-With',
      'x-guest-token',
      'apollo-require-preflight',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`Application is running on: ${url} (0.0.0.0)`);
  if (process.env.SWAGGER_ENABLED !== 'false') {
    console.log(`Swagger UI: ${url}/api/docs`);
  }
}
bootstrap();
