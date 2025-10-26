import { DetalleVenta } from "src/detalle_venta/entities/detalle_venta.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn  } from "typeorm";
import { Usuario } from "src/usuario/entities/usuario.entity";

@Entity({ name: 'Venta' })
export class Venta {

    @PrimaryGeneratedColumn()
    id_venta: number;


    
    @CreateDateColumn({
        name: 'fecha',
        type: 'timestamp',
    })
    fecha: Date;
    
    @Column({nullable: false, default: 0, type: 'decimal', precision: 10, scale: 2})
    total: number;

    // Relacion usuario
    @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
    @JoinColumn({name: 'id_usuario'})
    usuario: Usuario;

    // Relacion detalle_venta
    @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, {
        cascade: true,
    })
    detalles: DetalleVenta[];


    @DeleteDateColumn({
        name:'fecha_eliminacion',
        type: 'timestamp',
        nullable: true
    })
    fecha_eliminacion?: Date;

    @CreateDateColumn({ name: 'fecha_creacion' }) // <-- Columna en la DB
    fecha_creacion: Date; // <-- Propiedad en la clase   
}
