// src/auth/auth.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; // <-- CORRECCIÓN 1
import { RolUsuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

// Mock del AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockAuthService.register.mockClear();
    mockAuthService.login.mockClear();
  });

  /**
   * @Scenario: Registro exitoso de un nuevo VENDEDOR
   */
  it('POST /auth/register - should register a new user as VENDEDOR', async () => {
    const registerDto: RegisterDto = {
      nombre: 'Nuevo Vendedor',
      email: 'vendedor@test.com',
      contraseña: 'password123',
    };

    // --- CORRECCIÓN 2 ---
    // Sacamos la contraseña del DTO antes de crear el objeto esperado
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contraseña, ...restOfDto } = registerDto; 

    const expectedUser = {
      id_usuario: 1,
      ...restOfDto, // Usamos el DTO sin la contraseña
      rol: RolUsuario.VENDEDOR,
    };
    // Ya no necesitamos 'delete'
    // ---------------------

    mockAuthService.register.mockResolvedValueOnce(expectedUser);

    const response = await request(app.getHttpServer()) // <-- Ahora funciona
      .post('/auth/register')
      .send(registerDto)
      .expect(201); 

    expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    expect(response.body).toEqual(expectedUser);
  });

  /**
   * @Scenario: Inicio de sesión exitoso de un ADMIN
   */
  it('POST /auth/login - should log in an ADMIN and return a token', async () => {
    const loginDto: LoginDto = {
      email: 'admin@test.com',
      contraseña: 'password123',
    };

    const adminUser = {
      id_usuario: 2,
      nombre: 'Admin User',
      email: 'admin@test.com',
      rol: RolUsuario.ADMIN,
    };

    const loginResponse = {
      token: 'mock-jwt-token-admin',
      user: adminUser,
    };

    mockAuthService.login.mockResolvedValueOnce(loginResponse);

    const response = await request(app.getHttpServer()) // <-- Ahora funciona
      .post('/auth/login')
      .send(loginDto)
      .expect(201); 

    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    expect(response.body.token).toEqual(loginResponse.token);
    expect(response.body.user.rol).toEqual(RolUsuario.ADMIN);
  });
});