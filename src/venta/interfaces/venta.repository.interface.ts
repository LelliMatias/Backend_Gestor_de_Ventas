import { Venta } from "../entities/venta.entity";
import { CreateVentaDto } from "../dto/create-venta.dto";
import { UpdateVentaDto } from "../dto/update-venta.dto";
import { FindOneOptions, FindManyOptions } from "typeorm";

export interface IVentaRepository{
    findAll(): Promise<Venta[]>;
    findById(id: number): Promise<Venta | null>;
    create(createVentaDto: CreateVentaDto): Promise<Venta>;
    update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta>;
    remove(venta: Venta): Promise<Venta>;
     /**
         * Busca una entidad 'Venta' que coincida con las opciones.
         * Esencial para usar 'withDeleted: true' en el servicio.
         */
    findOne(options: FindOneOptions<Venta>): Promise<Venta | null>;
    softDelete(id: number): Promise<void>;
    restore(id: number): Promise<void>;
    find(options: FindManyOptions<Venta>): Promise<Venta[]>;
}