import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductoProveedor } from '../../productos/entities/producto-proveedor.entity'

@Entity({ name: 'Proveedor' })
export class Proveedor {
    @PrimaryGeneratedColumn({ name: 'id_proveedor' })
    id: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    nombre: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    telefono: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    direccion: string;

    @OneToMany(() => ProductoProveedor, (productoProveedor) => productoProveedor.proveedor)
    productoProveedores: ProductoProveedor[];

}