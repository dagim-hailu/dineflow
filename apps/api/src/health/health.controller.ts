import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness probe for load balancers and ops' })
  health(): { status: string; service: string } {
    return { status: 'ok', service: 'dineflow-api' };
  }
}
