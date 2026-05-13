import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { EventsModule } from './modules/events/events.module';
import { TableModule } from './modules/table/table.module';
import { BookingModule } from './modules/booking/booking.module';
import { GqlAuthGuard } from './modules/auth/guards/gql-auth.guard';
import { PublicGuard } from './modules/auth/guards/public.guard';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    HealthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req, res }) => ({ req, res }),
      playground: process.env.GRAPHQL_PLAYGROUND !== 'false',
      introspection: process.env.GRAPHQL_INTROSPECTION !== 'false',
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    AuthModule,
    MenuModule,
    OrderModule,
    EventsModule,
    TableModule,
    BookingModule,
  ],
  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PublicGuard,
    },
  ],
})
export class AppModule {}
