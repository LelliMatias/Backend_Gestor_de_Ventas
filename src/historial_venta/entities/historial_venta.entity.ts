import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Venta } from "../../venta/entities/venta.entity";
import { Usuario } from "../../usuario/entities/usuario.entity";

// Definimos los tipos de acciones que guardaremos
export enum TipoAccionHistorial {
    CREACION = 'CREACION',
    MODIFICACION = 'MODIFICACION',
    CANCELACION = 'CANCELACION', // Soft Delete
    RESTAURACION = 'RESTAURACION'
}

@Entity({ name: 'Historial_Venta' })
export class HistorialVenta {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Venta)
    @JoinColumn({ name: 'id_venta' })
    venta: Venta;

    // El usuario que realizó la acción (del token JWT)
    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'id_usuario_accion' }) 
    usuario: Usuario;

    @Column({ type: 'enum', enum: TipoAccionHistorial })
    accion: TipoAccionHistorial;

    @Column('text', { nullable: true })
    motivo: string; // Ej: "Corrección de cantidad"

    // Snapshots en JSON de los detalles
    @Column('json', { nullable: true })
    datos_anteriores: any; 

    @Column('json', { nullable: true })
    datos_nuevos: any; 

    @CreateDateColumn()
    fecha: Date;
}