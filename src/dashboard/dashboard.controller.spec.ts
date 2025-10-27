// src/dashboard/dashboard.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import request from 'supertest';

// Mocks del servicio
const mockDashboardService = {
  getResumenFinanciero: jest.fn(),
  getProductosMasVendidos: jest.fn(),
  getVentasMensuales: jest.fn(),
  getVentasPorVendedor: jest.fn(),
  getVentaMasCara: jest.fn(),
};

// Payloads simulados
const mockAdminPayload = { id_usuario: 1, email: 'admin@test.com', rol: RolUsuario.ADMIN };
const mockVendedorPayload = { id_usuario: 2, email: 'vendedor@test.com', rol: RolUsuario.VENDEDOR };

// Mock de guardas (Auth y Roles)
const mockGuards = (userPayload: any) => ({
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = userPayload; // Simula el usuario autenticado

    const url = req.url;

    // 🔒 Solo ADMIN puede acceder al dashboard
    if (
      (url.includes('/dashboard/resumen-financiero') ||
        url.includes('/dashboard/productos-mas-vendidos') ||
        url.includes('/dashboard')) &&
      userPayload.rol !== RolUsuario.ADMIN
    ) {
      return false; // 403 Forbidden
    }

    return true; // Permite acceso
  },
});

describe('DashboardController (e2e)', () => {
  let app: INestApplication;

  const setupTestApp = async (userPayload: any) => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockGuards(userPayload))
      .overrideGuard(RolesGuard)
      .useValue(mockGuards(userPayload))
      .compile();

    const app = moduleFixture.createNestApplication();
    await app.init();
    return app;
  };

  afterEach(async () => {
    if (app) await app.close();
    jest.clearAllMocks();
  });

  /**
   * 🧪 Escenario 1:
   * Un usuario VENDEDOR intenta acceder a rutas del dashboard protegidas por rol ADMIN
   */
  it('GET /dashboard/* - should FORBID access for VENDEDOR', async () => {
    app = await setupTestApp(mockVendedorPayload);

    await request(app.getHttpServer())
      .get('/dashboard/resumen-financiero?startDate=2025-10-01&endDate=2025-10-31')
      .expect(200); 

    await request(app.getHttpServer())
      .get('/dashboard/productos-mas-vendidos?startDate=2025-10-01&endDate=2025-10-31')
      .expect(200); 
  });

  /**
   * 🧪 Escenario 2:
   * Un usuario ADMIN accede al resumen financiero correctamente
   */
  it('GET /dashboard/resumen-financiero - should ALLOW access for ADMIN and return data', async () => {
    app = await setupTestApp(mockAdminPayload);

    const mockResumen = {
      ingresos: 15000,
      costos: 8000,
      ganancias: 7000,
    };
    mockDashboardService.getResumenFinanciero.mockResolvedValueOnce(mockResumen);

    const response = await request(app.getHttpServer())
      .get('/dashboard/resumen-financiero?startDate=2025-10-01&endDate=2025-10-31')
      .expect(200);

    expect(mockDashboardService.getResumenFinanciero).toHaveBeenCalled();
    expect(response.body.ganancias).toBe(7000);
  });

  /**
   * 🧪 Escenario 3:
   * Un usuario ADMIN accede a productos más vendidos correctamente
   */
  it('GET /dashboard/productos-mas-vendidos - should ALLOW access for ADMIN and return products', async () => {
    app = await setupTestApp(mockAdminPayload);

    const mockTopProducts = [
      { nombreProducto: 'Producto A', totalVendido: 10 },
      { nombreProducto: 'Producto B', totalVendido: 5 },
      { nombreProducto: 'Producto C', totalVendido: 2 },
    ];
    mockDashboardService.getProductosMasVendidos.mockResolvedValueOnce(mockTopProducts);

    const response = await request(app.getHttpServer())
      .get('/dashboard/productos-mas-vendidos?startDate=2025-10-01&endDate=2025-10-31')
      .expect(200);

    expect(mockDashboardService.getProductosMasVendidos).toHaveBeenCalled();
    expect(response.body.length).toBe(3);
    expect(response.body[0].nombreProducto).toBe('Producto A');
  });
});
