import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { Usuario } from './entities/usuario.entity';
import { UsuarioRepository } from './repositories/usuario.repository'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    {
      provide: 'IUsuarioRepository', 
      useClass: UsuarioRepository,   
    },
  ],
})
export class UsuarioModule {}