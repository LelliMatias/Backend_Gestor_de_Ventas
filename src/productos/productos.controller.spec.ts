// src/productos/productos.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuario/entities/usuario.entity';
import request from 'supertest';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateProveedoresDto } from './dto/update-proveedores.dto';

// Mocks
const mockProductosService = {
  create: jest.fn(),
  update: jest.fn(),
  updateProveedoresForProducto: jest.fn(),
};

const mockAdminPayload = { id_usuario: 1, email: 'admin@test.com', rol: RolUsuario.ADMIN };

// Mock de Guard (similar al del dashboard)
const mockAdminGuard = {
  canActivate: (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    req.user = mockAdminPayload; // Inyecta ADMIN
    // (Asumimos que el @Roles(RolUsuario.ADMIN) está presente en el controlador)
    return true; 
  },
};

describe('ProductosController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductosController],
      providers: [
        { provide: ProductosService, useValue: mockProductosService },
      ],
    })
    // Asumimos que AÑADIRÁS estos guards a tu controlador
    .overrideGuard(AuthGuard('jwt')) 
    .useValue(mockAdminGuard)
    .overrideGuard(RolesGuard) 
    .useValue(mockAdminGuard)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * @Scenario: Creación exitosa de un nuevo producto
   */
  it('POST /productos - should create a new product (as ADMIN)', async () => {
    const createDto: CreateProductoDto = {
      nombre: 'Zapatilla Air Max',
      id_marca: 1, // "Nike"
      id_linea: 5, // "Running"
      precio_unitario: 150.00,
      stock_actual: 100,
    };
    
    const mockCreatedProduct = { id: 10, ...createDto };
    mockProductosService.create.mockResolvedValueOnce(mockCreatedProduct);

    const response = await request(app.getHttpServer())
      .post('/productos')
      .send(createDto)
      .expect(201); // HTTP 201 Created

    expect(mockProductosService.create).toHaveBeenCalledWith(createDto);
    expect(response.body.nombre).toBe('Zapatilla Air Max');
  });

  /**
   * @Scenario: Edición de un producto existente
   */
  it('PATCH /productos/:id - should update a product (as ADMIN)', async () => {
    const updateDto: UpdateProductoDto = {
      stock_actual: 120,
    };
    
    const mockUpdatedProduct = {
      id: 10,
      nombre: 'Zapatilla Air Max',
      stock_actual: 120,
      // ... otros campos
    };
    mockProductosService.update.mockResolvedValueOnce(mockUpdatedProduct);

    const response = await request(app.getHttpServer())
      .patch('/productos/10') // ID del producto
      .send(updateDto)
      .expect(200); // HTTP 200 OK

    expect(mockProductosService.update).toHaveBeenCalledWith(10, updateDto);
    expect(response.body.stock_actual).toBe(120);
  });

  /**
   * @Scenario: Asignación de proveedores a un producto existente
   */
  it('PUT /productos/:id/proveedores - should assign suppliers (as ADMIN)', async () => {
    const updateProveedoresDto: UpdateProveedoresDto = {
      proveedores: [
        { proveedorId: 1, precioCompra: 80.50, codigoProveedor: 'NK-AM-A' }, // Proveedor A
        { proveedorId: 2, precioCompra: 82.00, codigoProveedor: undefined }, // Proveedor B
      ],
    };
    
    const mockResult = [ /* ... lista de relaciones creadas ... */ ];
    mockProductosService.updateProveedoresForProducto.mockResolvedValueOnce(mockResult);

    await request(app.getHttpServer())
      .put('/productos/10/proveedores') // ID del producto
      .send(updateProveedoresDto)
      .expect(200); // HTTP 200 OK

    expect(mockProductosService.updateProveedoresForProducto)
      .toHaveBeenCalledWith(10, updateProveedoresDto);
  });
});