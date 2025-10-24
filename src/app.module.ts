import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MarcasModule } from './marcas/marcas.module';
import { LineasModule } from './lineas/lineas.module';
import { ProductosModule } from './productos/productos.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { VentaModule } from './venta/venta.module';
import { DetalleVentaModule } from './detalle_venta/detalle_venta.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que el ConfigModule esté disponible en toda la app
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    MarcasModule,
    LineasModule,
    ProductosModule,
    AuthModule,
    UsuarioModule,
    VentaModule,
    DetalleVentaModule,
    ProveedoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
