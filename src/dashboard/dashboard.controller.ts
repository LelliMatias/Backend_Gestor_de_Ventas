import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DateRangeDto } from './dto/date-range.dto';
import { AuthGuard } from '@nestjs/passport'; 
import { RolesGuard } from '../auth/guards/roles.guard'; 
import { Roles } from '../auth/decorators/roles.decorators'; 
import { RolUsuario } from '../usuario/entities/usuario.entity';

@Controller('dashboard')
// NOTA: Deberías proteger el dashboard, al menos con el AuthGuard
// @UseGuards(AuthGuard('jwt'), RolesGuard) 
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('resumen-financiero')
  // @Roles(RolUsuario.ADMIN) // Ejemplo de cómo protegerlo solo para ADMIN
  getResumenFinanciero(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getResumenFinanciero(dateRange);
  }

  @Get('ventas-mensuales')
  // @Roles(RolUsuario.ADMIN)
  getVentasMensuales(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getVentasMensuales(dateRange);
  }

  @Get('productos-mas-vendidos')
  // @Roles(RolUsuario.ADMIN)
  getProductosMasVendidos(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getProductosMasVendidos(dateRange);
  }

  // --- NUEVO ENDPOINT 1 ---
  @Get('ventas-por-vendedor')
  // @Roles(RolUsuario.ADMIN)
  getVentasPorVendedor(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getVentasPorVendedor(dateRange);
  }

  // --- NUEVO ENDPOINT 2 ---
  @Get('venta-mas-cara')
  // @Roles(RolUsuario.ADMIN)
  getVentaMasCara(@Query() dateRange: DateRangeDto) {
    return this.dashboardService.getVentaMasCara(dateRange);
  }
}