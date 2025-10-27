import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DateRangeDto } from './dto/date-range.dto';
import { ProductoProveedor } from 'src/productos/entities/producto-proveedor.entity';
import { DetalleVenta } from 'src/detalle_venta/entities/detalle_venta.entity';
import { Venta } from 'src/venta/entities/venta.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) { }

  async getResumenFinanciero(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    // Subconsulta para calcular el costo promedio de cada producto
    const costoPromedioSubQuery = this.dataSource.createQueryBuilder()
      .select('pp.productoId', 'productoId')
      .addSelect('AVG(pp.precioCompra)', 'costoPromedio')
      .from(ProductoProveedor, 'pp')
      .groupBy('pp.productoId');

    // Consulta principal corregida
    const result = await this.dataSource.createQueryBuilder()
      .select('SUM(detalle.subtotal)', 'ingresosTotales')
      .addSelect('SUM(detalle.cantidad * costo.costoPromedio)', 'costosTotales')
      .from(DetalleVenta, 'detalle')
      .innerJoin('detalle.venta', 'venta')
      // --- CORRECCIÓN CLAVE AQUÍ ---
      // Unimos con la subconsulta usando la RELACIÓN 'detalle.producto'
      .innerJoin(
        `(${costoPromedioSubQuery.getQuery()})`,
        'costo',
        'detalle.producto = costo.productoId' // TypeORM traducirá 'detalle.producto' al ID correcto
      )
      .where('venta.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
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
      .from('Venta', 'v')
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy("mes")
      .orderBy("mes", "ASC")
      .getRawMany();
  }

  async getProductosMasVendidos(dateRange: DateRangeDto) {
    const { startDate, endDate } = dateRange;

    return this.dataSource.createQueryBuilder()
      .select('p.nombre', 'nombreProducto')
      .addSelect('SUM(dv.cantidad)', 'totalVendido')
      .from('Detalle_Venta', 'dv')
      .innerJoin('Producto', 'p', 'dv.id_producto = p.id_producto')
      .innerJoin('Venta', 'v', 'dv.id_venta = v.id_venta')
      .where('v.fecha BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('p.id_producto')
      .addGroupBy('p.nombre')
      .orderBy('totalVendido', 'DESC')
      .limit(10)
      .getRawMany();
  }
}