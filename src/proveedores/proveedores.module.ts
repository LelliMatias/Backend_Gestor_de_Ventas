import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { ProveedorRepository } from './repositories/proveedor.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([Proveedor])
  ],
  controllers: [ProveedoresController],
  providers: [
    ProveedoresService,
    {
      provide: 'IProveedorRepository',
      useClass: ProveedorRepository,
    },
  ],
  exports: [ProveedoresService]
})
export class ProveedoresModule { }