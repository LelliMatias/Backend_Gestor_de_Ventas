import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProveedorRepository } from './interfaces/proveedor.repository.interface';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @Inject('IProveedorRepository')
    private readonly proveedorRepository: IProveedorRepository,
  ) { }

  async create(createProveedorDto: CreateProveedorDto) {
    return this.proveedorRepository.create(createProveedorDto);
  }

  async findAll() {
    return this.proveedorRepository.findAll();
  }

  async findOne(id: number) {
    const proveedor = await this.proveedorRepository.findById(id);
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID #${id} no encontrado`);
    }
    return proveedor;
  }
  // ... métodos update y remove
}