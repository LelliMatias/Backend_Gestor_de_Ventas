import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HistorialVenta, TipoAccionHistorial } from './entities/historial_venta.entity';
import { Venta } from '../venta/entities/venta.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class HistorialVentaService {
    constructor(
        @InjectRepository(HistorialVenta)
        private readonly historialRepo: Repository<HistorialVenta>,
    ) {}

    /**
     * Registra una acción en el historial.
     * Puede ser llamado desde un QueryRunner (transacción) o no.
     */
    async registrarAccion(
        manager: EntityManager, // Usamos EntityManager para que funcione dentro o fuera de transacciones
        venta: Venta,
        usuario: Usuario,
        accion: TipoAccionHistorial,
        datosAnteriores: any = null,
        datosNuevos: any = null,
        motivo: string = ''
    ): Promise<void> {
        
        const registro = manager.create(HistorialVenta, {
            venta,
            usuario,
            accion,
            datos_anteriores: datosAnteriores,
            datos_nuevos: datosNuevos,
            motivo
        });
        await manager.save(registro);
    }

    /**
     * Busca todo el historial de una venta específica.
     */
    async findByVentaId(id_venta: number): Promise<HistorialVenta[]> {
        return this.historialRepo.find({
            where: { venta: { id_venta } },
            relations: ['usuario'], // Carga el usuario que hizo la acción
            order: { fecha: 'DESC' }
        });
    }
}