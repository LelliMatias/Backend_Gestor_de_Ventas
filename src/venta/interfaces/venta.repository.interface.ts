import { Venta } from "../entities/venta.entity";
import { CreateVentaDto } from "../dto/create-venta.dto";
import { UpdateVentaDto } from "../dto/update-venta.dto";

export interface IVentaRepository{
    findAll(): Promise<Venta[]>;
    findById(id: number): Promise<Venta | null>;
    create(createVentaDto: CreateVentaDto): Promise<Venta>;
    update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta>;
    remove(venta: Venta): Promise<Venta>;
}