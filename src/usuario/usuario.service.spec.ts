// src/usuario/usuario.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';

// Si usas TypeORM reemplaza el provide por getRepositoryToken(Usuario)
const mockUsuarioRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: 'IUsuarioRepository', useValue: mockUsuarioRepository },
        // Si usas TypeORM:
        // { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepository }
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
