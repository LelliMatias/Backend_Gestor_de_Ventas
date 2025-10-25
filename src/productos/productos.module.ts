// src/productos/productos.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { Producto } from './entities/producto.entity';
import { ProductoRepository } from './repository/producto.repository';
import { MarcasModule } from '../marcas/marcas.module';
import { LineasModule } from '../lineas/lineas.module';
import { ProductoProveedor } from './entities/producto-proveedor.entity';
import { ProveedoresModule } from 'src/proveedores/proveedores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, ProductoProveedor]),
    MarcasModule,
    LineasModule,
    ProveedoresModule
  ],
  controllers: [ProductosController],
  providers: [
    ProductosService,
    {
      provide: 'IProductoRepository',
      useClass: ProductoRepository,
    },
  ],
  exports: [
    'IProductoRepository',
    ProductosService,
  ]
})
export class ProductosModule { }