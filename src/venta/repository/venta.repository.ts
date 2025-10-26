// src/venta/repository/venta.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
// --- Asegúrate de importar FindOneOptions ---
import { FindOneOptions, FindManyOptions, Repository } from "typeorm";
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

    findById(id: number): Promise<Venta | null> {
        return this.typeormRepository.findOne({ where: { id_venta: id }, relations: ['usuario', 'detalles', 'detalles.producto'] });
    }

    find(options: FindManyOptions<Venta>): Promise<Venta[]> {
        return this.typeormRepository.find(options);
    }

    create(CreateVentaDto: CreateVentaDto): Promise<Venta> {
        // Correcto, la creación de Venta es transaccional y se maneja en el servicio.
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

    /**
     * @deprecated Este método usa softRemove (requiere la entidad). 
     * Es mejor usar softDelete(id) desde el servicio.
     */
    async remove(venta: Venta): Promise<Venta> {
        // Este es 'softRemove', que es válido pero 'softDelete' es más eficiente
        return this.typeormRepository.softRemove(venta); 
    }

    findOne(options: FindOneOptions<Venta>): Promise<Venta | null> {
        // Simplemente pasamos las opciones al repositorio de TypeORM
        return this.typeormRepository.findOne(options);
    }

    async softDelete(id: number): Promise<void> {
        // softDelete actualiza la columna 'fecha_eliminacion' basado en el ID.
        // Devuelve un UpdateResult, pero la interfaz espera void, 
        // así que usamos await y no retornamos nada.
        await this.typeormRepository.softDelete(id);
    }


    async restore(id: number): Promise<void> {
        // restore pone 'fecha_eliminacion' en NULL basado en el ID.
        await this.typeormRepository.restore(id);
    }
}