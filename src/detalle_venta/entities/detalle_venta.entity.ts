import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, DeleteDateColumn } from "typeorm";
import { Venta } from "../../venta/entities/venta.entity";
import { Producto } from "src/productos/entities/producto.entity";

@Entity({name: 'DetalleVenta'})
export class DetalleVenta {

    @PrimaryGeneratedColumn()
    id_detalle: number;

    @Column('int')
    cantidad: number;

    @Column('decimal', { precision: 10, scale: 2 })
    precio_unitario: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;
    
      
    // Relacion a venta
    @ManyToOne(() => Venta, (venta) => venta.detalles)
    @JoinColumn({ name: 'id_venta'}) // FK
    venta: Venta;
    
    // Relacion a producto
    @ManyToOne(() => Producto, (producto) => producto.detalles)
    @JoinColumn({ name: 'id_producto'}) // FK
    producto: Producto;

    @DeleteDateColumn({
        name: 'fecha_eliminacion',
        type: 'timestamp',
        nullable: true
    })
    fecha_eliminacion?: Date;





}
