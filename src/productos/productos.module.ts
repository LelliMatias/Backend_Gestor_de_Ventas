// src/productos/productos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { ProductoRepository } from './repository/producto.repository.interface';
import { MarcasModule } from '../marcas/marcas.module';
import { LineasModule } from '../lineas/lineas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto]),
    MarcasModule,
    LineasModule,
  ],
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: 'IProductoRepository',
      useClass: ProductoRepository,
    },
  ],
})
export class ProductosModule { }