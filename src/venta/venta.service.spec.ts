import { Test, TestingModule } from '@nestjs/testing';
import { VentaService } from './venta.service';
import { DataSource } from 'typeorm';
import { HistorialVentaService } from '../historial_venta/historial_venta.service';

describe('VentaService', () => {
  let service: VentaService;

  const mockDataSource = {};
  const mockVentaRepository = {};
  const mockProductoRepository = {};
  const mockHistorialVentaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentaService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: 'IVentaRepository', useValue: mockVentaRepository },
        { provide: 'IProductoRepository', useValue: mockProductoRepository },
        { provide: HistorialVentaService, useValue: mockHistorialVentaService },
      ],
    }).compile();

    service = module.get<VentaService>(VentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
