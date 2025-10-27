import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DateRangeDto } from './dto/date-range.dto';
import { ProductoProveedor } from 'src/productos/entities/producto-proveedor.entity';
import { DetalleVenta } from 'src/detalle_venta/entities/detalle_venta.entity';
import { Venta } from 'src/venta/entities/venta.entity';
// --- NUEVA IMPORTACIÓN ---
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) { }

  async getResumenFinanciero(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    const costoPromedioSubQuery = this.dataSource.createQueryBuilder()
      .select('pp.productoId', 'productoId')
      .addSelect('AVG(pp.precioCompra)', 'costoPromedio')
      .from(ProductoProveedor, 'pp')
      .groupBy('pp.productoId');

    const result = await this.dataSource.createQueryBuilder()
      .select('SUM(detalle.subtotal)', 'ingresosTotales')
      .addSelect('SUM(detalle.cantidad * costo.costoPromedio)', 'costosTotales')
      .from(DetalleVenta, 'detalle')
      .innerJoin('detalle.venta', 'venta')
      .innerJoin(
        `(${costoPromedioSubQuery.getQuery()})`,
        'costo',
        'detalle.producto = costo.productoId'
      )
      .where('venta.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      // --- AJUSTE: Excluir ventas canceladas del cálculo ---
      .andWhere('venta.fecha_eliminacion IS NULL') 
      .getRawOne();

    const ingresos = parseFloat(result.ingresosTotales) || 0;
    const costos = parseFloat(result.costosTotales) || 0;

    return {
      ingresos: ingresos,
      costos: costos,
      ganancias: ingresos - costos,
    };
  }

  async getVentasMensuales(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    return this.dataSource.createQueryBuilder()
      .select("DATE_FORMAT(v.fecha, '%Y-%m')", "mes")
      .addSelect("SUM(v.total)", "totalVentas")
      .from(Venta, 'v') // Usamos la Entidad Venta
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      // --- AJUSTE: Excluir ventas canceladas del cálculo ---
      .andWhere('v.fecha_eliminacion IS NULL')
      .groupBy("mes")
      .orderBy("mes", "ASC")
      .getRawMany();
  }

  async getProductosMasVendidos(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    return this.dataSource.createQueryBuilder()
      .select('p.nombre', 'nombreProducto')
      .addSelect('SUM(dv.cantidad)', 'totalVendido')
      // Usamos las entidades para mayor claridad
      .from(DetalleVenta, 'dv') 
      .innerJoin('dv.producto', 'p') // Asumiendo relación 'producto' en DetalleVenta
      .innerJoin('dv.venta', 'v')     // Asumiendo relación 'venta' en DetalleVenta
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      // --- AJUSTE: Excluir ventas canceladas del cálculo ---
      .andWhere('v.fecha_eliminacion IS NULL')
      .groupBy('p.id') // Agrupar por ID de producto
      .addGroupBy('p.nombre')
      .orderBy('totalVendido', 'DESC')
      .limit(10)
      .getRawMany();
  }

  // --- NUEVO MÉTODO 1: VENTAS POR VENDEDOR ---
  async getVentasPorVendedor(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;
    
    return this.dataSource.createQueryBuilder()
      .select('u.nombre', 'vendedor')
      .addSelect('COUNT(v.id_venta)', 'cantidadVentas')
      .addSelect('SUM(v.total)', 'totalVendido')
      .from(Venta, 'v')
      .innerJoin('v.usuario', 'u') // Unimos Venta con Usuario (vendedor)
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('v.fecha_eliminacion IS NULL') // Solo ventas activas
      .andWhere('u.fecha_eliminacion IS NULL') // Solo vendedores activos
      .groupBy('u.id_usuario') // Agrupamos por el ID del usuario
      .addGroupBy('u.nombre') // Y su nombre
      .orderBy('totalVendido', 'DESC')
      .getRawMany();
  }

  // --- NUEVO MÉTODO 2: VENTA MÁS CARA ---
  async getVentaMasCara(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    return this.dataSource.createQueryBuilder()
      .select('v.id_venta', 'idVenta')
      .addSelect('v.fecha', 'fecha')
      .addSelect('v.total', 'total')
      .addSelect('u.nombre', 'vendedor') // Añadimos el nombre del vendedor
      .from(Venta, 'v')
      .innerJoin('v.usuario', 'u')
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('v.fecha_eliminacion IS NULL') // Solo ventas activas
      .orderBy('v.total', 'DESC') // Ordenamos por total descendente
      .limit(1) // Tomamos solo la primera
      .getRawOne(); // Esperamos un solo resultado
  }
}