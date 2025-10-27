import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DateRangeDto } from './dto/date-range.dto';
import { AuthGuard } from '@nestjs/passport'; // AuthGuard viene de @nestjs/passport
import { RolesGuard } from '../auth/guards/roles.guard'; // Apunta al archivo que acabas de crear
import { Roles } from '../auth/decorators/roles.decorators'; // Apunta al archivo que acabas de crear
import { RolUsuario } from '../usuario/entities/usuario.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('resumen-financiero')
  getResumenFinanciero(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getResumenFinanciero(dateRange);
  }

  @Get('ventas-mensuales')
  getVentasMensuales(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getVentasMensuales(dateRange);
  }

  @Get('productos-mas-vendidos')
  getProductosMasVendidos(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getProductosMasVendidos(dateRange);
  }
}