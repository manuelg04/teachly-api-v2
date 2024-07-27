import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getDatabaseConfig } from './database.config';

config();

const configService = new ConfigService();

const initialOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_typeorm',
};

const AppDataSource = new DataSource(initialOptions);

// Inicialización asíncrona
const initializeDataSource = async () => {
  const sshConfig = await getDatabaseConfig(configService);
  Object.assign(AppDataSource, sshConfig);
  return AppDataSource;
};

export { AppDataSource, initializeDataSource };
