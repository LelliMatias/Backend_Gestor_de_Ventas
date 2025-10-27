// src/productos/productos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AddProveedorDto } from './dto/add-proveedor.dto';
import { UpdateProveedoresDto } from './dto/update-proveedores.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @Post()
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }

  @Post(':id/proveedores')
  addProveedor(
    @Param('id', ParseIntPipe) productoId: number,
    @Body() addProveedorDto: AddProveedorDto,
  ) {
    return this.productosService.addProveedorToProducto(productoId, addProveedorDto);
  }

  @Get(':id/proveedores')
  findProveedoresByProducto(@Param('id', ParseIntPipe) productoId: number) {
    return this.productosService.findProveedoresByProductoId(productoId);
  }

  @Put(':id/proveedores')
  updateProveedores(
    @Param('id', ParseIntPipe) productoId: number,
    @Body() updateProveedoresDto: UpdateProveedoresDto,
  ) {
    return this.productosService.updateProveedoresForProducto(productoId, updateProveedoresDto);
  }

  @Get(':id/proveedores')
  findProveedoresByProducto(@Param('id', ParseIntPipe) productoId: number) {
    return this.productosService.findProveedoresByProductoId(productoId);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.restore(id);
  }
}