import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { ProductosModule } from 'src/productos/productos.module';
import { DetalleVentaModule } from 'src/detalle_venta/detalle_venta.module';
import { VentaRepository } from './repository/venta.repository';
import { HistorialVentaModule } from 'src/historial_venta/historial_venta.module';

@Module({
  controllers: [VentaController],
  providers: [
    VentaService,
    {provide: 'IVentaRepository', useClass: VentaRepository},
  ],
  imports: [
    TypeOrmModule.forFeature([Venta]),
    ProductosModule,
    DetalleVentaModule,
    HistorialVentaModule,
  ],
})
export class VentaModule {}
