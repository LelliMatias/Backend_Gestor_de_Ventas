// src/dashboard/dashboard.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoProveedor } from 'src/productos/entities/producto-proveedor.entity';
import { DetalleVenta } from 'src/detalle_venta/entities/detalle_venta.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { DataSource } from 'typeorm';

const mockRepo = { find: jest.fn(), findOne: jest.fn(), query: jest.fn() };
const mockDataSource = { query: jest.fn(), manager: { query: jest.fn() } };

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(ProductoProveedor), useValue: mockRepo },
        { provide: getRepositoryToken(DetalleVenta), useValue: mockRepo },
        { provide: getRepositoryToken(Venta), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
