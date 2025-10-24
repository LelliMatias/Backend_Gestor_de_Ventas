// src/productos/entities/producto.entity.ts
import { Linea } from '../../lineas/entities/linea.entity';
import { Marca } from '../../marcas/entities/marca.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { DetalleVenta } from '../../detalle_venta/entities/detalle_venta.entity';
import { ProductoProveedor } from './producto-proveedor.entity';

@Entity({ name: 'Producto' })
export class Producto {
    @PrimaryGeneratedColumn({ name: 'id_producto' })
    id: number;

    @Column({ type: 'varchar', length: 150 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2 })
    precioUnitario: number;

    @Column({ name: 'stock_actual', type: 'int' })
    stockActual: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    imagen: string;


    @ManyToOne(() => Marca, { nullable: false, eager: true }) // eager deberia cargar la relacion de manera automatica
    @JoinColumn({ name: 'id_marca' })
    marca: Marca;

    @ManyToOne(() => Linea, { nullable: false, eager: true }) // eager deberia cargar la relacion de manera automatica
    @JoinColumn({ name: 'id_linea' })
    linea: Linea;


    // Relacion con detalle_venta
    @ManyToOne(() => DetalleVenta, (detalle_venta) => detalle_venta.producto)
    detalles: DetalleVenta[];

    @DeleteDateColumn({
        name: 'fecha_eliminacion',
        type: 'timestamp',
        nullable: true
    })
    fecha_eliminacion?: Date;

    @OneToMany(() => ProductoProveedor, (productoProveedor) => productoProveedor.producto)
    productoProveedores: ProductoProveedor[];
}