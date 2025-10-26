import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialVenta } from './entities/historial_venta.entity';
import { HistorialVentaService } from './historial_venta.service';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialVenta])],
  providers: [HistorialVentaService],
  exports: [HistorialVentaService] // Exportamos el servicio para usarlo en VentaModule
})
export class HistorialVentaModule {}