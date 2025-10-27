// src/proveedores/proveedores.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProveedoresService } from './proveedores.service';

// Mock del repositorio
const mockProveedorRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('ProveedoresService', () => {
  let service: ProveedoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProveedoresService,
        // Proveer el token que tu servicio espera. Si usas @Inject('IProveedorRepository') usa esta línea:
        { provide: 'IProveedorRepository', useValue: mockProveedorRepository },

        // Si usas TypeORM (InjectRepository), en su lugar usa:
        // import { getRepositoryToken } from '@nestjs/typeorm';
        // import { Proveedor } from './entities/proveedor.entity';
        // { provide: getRepositoryToken(Proveedor), useValue: mockProveedorRepository },
      ],
    }).compile();

    service = module.get<ProveedoresService>(ProveedoresService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
