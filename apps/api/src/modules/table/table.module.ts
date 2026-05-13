import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableResolver } from './table.resolver';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [TableService, TableResolver],
  exports: [TableService],
})
export class TableModule {}
