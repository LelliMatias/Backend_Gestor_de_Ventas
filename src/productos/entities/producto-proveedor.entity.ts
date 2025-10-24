import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Producto } from "./producto.entity";
import { Proveedor } from "../../proveedores/entities/proveedor.entity";

@Entity({ name: 'Producto_Proveedor' })
export class ProductoProveedor {
    @PrimaryColumn({ name: 'id_producto' })
    productoId: number;

    @PrimaryColumn({ name: 'id_proveedor' })
    proveedorId: number;

    @Column({ name: 'codigo_proveedor', type: 'varchar', length: 100, nullable: true })
    codigoProveedor: string; // [cite: 34]

    @Column({ name: 'precio_compra', type: 'decimal', precision: 10, scale: 2 })
    precioCompra: number; // [cite: 35]

    @ManyToOne(() => Producto, (producto) => producto.productoProveedores)
    @JoinColumn({ name: 'id_producto' })
    producto: Producto;

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.productoProveedores)
    @JoinColumn({ name: 'id_proveedor' })
    proveedor: Proveedor;
}