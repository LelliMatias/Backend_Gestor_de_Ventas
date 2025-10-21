import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios') // Es una convención usar plural en las rutas de API
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // Devuelve un código 201 en lugar de 200
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Get(':email')
  findOneByEmail(@Param('email') email: string) {
    return this.usuarioService.findOneByEmail(email);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Devuelve un código 204 que indica éxito sin contenido
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}