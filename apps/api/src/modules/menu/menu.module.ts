import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MenuService } from './menu.service';
import { MenuResolver } from './menu.resolver';
import { RedisModule } from '../../infrastructure/redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [MenuService, MenuResolver],
  exports: [MenuService],
})
export class MenuModule {}
