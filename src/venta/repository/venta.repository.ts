import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IVentaRepository } from "../interfaces/venta.repository.interface";
import { Venta } from "../entities/venta.entity";
import { CreateVentaDto } from "../dto/create-venta.dto";
import { UpdateVentaDto } from "../dto/update-venta.dto";

@Injectable()
export class VentaRepository implements IVentaRepository {
    constructor(
        @InjectRepository(Venta)
        private readonly typeormRepository: Repository<Venta>,
    ) { }

    findAll(): Promise<Venta[]> {
        return this.typeormRepository.find({relations: ['usuario', 'detalles', 'detalles.producto']});
    }

    // comparo la id que me pasan con la del objeto
    findById(id: number): Promise<Venta | null> {
        return this.typeormRepository.findOne({ where: { id_venta: id }, relations: ['usuario', 'detalles', 'detalles.producto'] });
    }

    create(CreateVentaDto: CreateVentaDto): Promise<Venta> {
        throw new Error('Usar metodo transanccional en el servicio');
    }

    async update(id: number, updateDto: UpdateVentaDto): Promise<Venta> {
        const venta = await this.findById(id);
        if (!venta) {
            throw new Error('Venta no encontrada');
        }
        this.typeormRepository.merge(venta, updateDto);
        return this.typeormRepository.save(venta);
    }

    // Soft delete
    async remove(venta: Venta): Promise<Venta> {
        return this.typeormRepository.softRemove(venta);
    }
}