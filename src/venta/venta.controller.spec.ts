// src/venta/venta.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
import { HistorialVentaService } from '../historial_venta/historial_venta.service';
import { INestApplication, BadRequestException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import request from 'supertest';

// Mocks de los servicios
const mockVentaService = {
  create: jest.fn(),
};
const mockHistorialService = {};

// Payload simulado del VENDEDOR que inyectaría el AuthGuard
const mockVendedorPayload = {
  id_usuario: 10,
  email: 'vendedor@shop.com',
  rol: RolUsuario.VENDEDOR,
};

describe('VentaController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [VentaController],
      providers: [
        { provide: VentaService, useValue: mockVentaService },
        { provide: HistorialVentaService, useValue: mockHistorialService },
      ],
    })
    .overrideGuard(AuthGuard('jwt')) // Sobrescribimos el Guard
    .useValue({
      // canActivate simula el éxito del guard e inyecta el req.user
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockVendedorPayload; // Inyectamos nuestro vendedor simulado
        return true;
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockVentaService.create.mockClear();
  });

  /**
   * @Scenario: Creación de una venta simple
   */
  it('POST /venta - should create a simple sale', async () => {
    const createVentaDto: CreateVentaDto = {
      detalles: [
        { id_producto: 1, cantidad: 2 }, // Producto A (2 * $10)
        { id_producto: 2, cantidad: 1 }, // Producto B (1 * $20)
      ],
    };

    // El Gherkin dice que el total es $40.00
    const mockVentaCreada = {
      id_venta: 1,
      total: 40.00,
      usuario: mockVendedorPayload,
      detalles: [ /* ... */ ],
    };

    mockVentaService.create.mockResolvedValueOnce(mockVentaCreada);

    const response = await request(app.getHttpServer())
      .post('/venta')
      .send(createVentaDto)
      .expect(201); // HTTP 201 Created

    // Verificamos que el servicio 'create' fue llamado con el DTO y el payload del usuario
    expect(mockVentaService.create).toHaveBeenCalledWith(createVentaDto, mockVendedorPayload);
    // Verificamos que el total es el correcto
    expect(response.body.total).toBe(40.00);
  });

  /**
   * @Scenario: Intento de venta con stock insuficiente
   */
  it('POST /venta - should reject sale due to insufficient stock', async () => {
    const createVentaDto: CreateVentaDto = {
      detalles: [
        { id_producto: 1, cantidad: 60 }, // Producto A (Stock 50)
      ],
    };

    // Simulamos que el VentaService (que valida el stock) lanza el error
    mockVentaService.create.mockRejectedValueOnce(
      new BadRequestException('Stock insuficiente para "Producto A"')
    );

    const response = await request(app.getHttpServer())
      .post('/venta')
      .send(createVentaDto)
      .expect(400); // HTTP 400 Bad Request

    // Verificamos que el servicio 'create' fue llamado
    expect(mockVentaService.create).toHaveBeenCalledWith(createVentaDto, mockVendedorPayload);
    // Verificamos el mensaje de error
    expect(response.body.message).toContain('Stock insuficiente');
  });
});