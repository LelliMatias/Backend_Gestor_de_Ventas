import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
// --- NUEVOS IMPORTS ---
import express from 'express';
import { UpdateVentaDetallesDto } from './dto/update-detalle-venta.dto';
import { HistorialVentaService } from 'src/historial_venta/historial_venta.service';

@Controller('venta')
@UseGuards(AuthGuard)
export class VentaController {
  constructor(
    private readonly ventaService: VentaService,
    // --- NUEVA INYECCIÓN ---
    private readonly historialService: HistorialVentaService
  ) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto, @Req() req: express.Request) {
    const usuarioPayload = req['user'];
    return this.ventaService.create(createVentaDto, usuarioPayload);
  }

  @Get()
  findAll() {
    return this.ventaService.findAll();
  }

  // --- NUEVO ENDPOINT ---
  @Get('con-borradas')
  findAllWithDeleted() {
    return this.ventaService.findAllWithDeleted();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventaService.findOne(id);
  }

  // --- NUEVO ENDPOINT ---
  @Get(':id/historial')
  findHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findByVentaId(id);
  }

  /**
   * Actualiza campos simples (ej. notas, estado)
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventaService.update(id, updateVentaDto);
  }

  // --- NUEVO ENDPOINT (PARA MODIFICAR DETALLES) ---
  @Patch(':id/detalles')
  updateDetalles(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateVentaDetallesDto: UpdateVentaDetallesDto,
    @Req() req: express.Request // Necesitamos el usuario para el historial
  ) {
    const usuarioPayload = req['user'];
    return this.ventaService.updateDetalles(id, updateVentaDetallesDto, usuarioPayload);
  }

  // --- ACTUALIZADO (para historial) ---
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: express.Request) {
    const usuarioPayload = req['user']; // Obtenemos el payload
    return this.ventaService.remove(id, usuarioPayload); // Se lo pasamos al servicio
  }

  // --- ACTUALIZADO (para historial) ---
  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number, @Req() req: express.Request) {
    const usuarioPayload = req['user']; // Obtenemos el payload
    return this.ventaService.restore(id, usuarioPayload); // Se lo pasamos al servicio
  }
}