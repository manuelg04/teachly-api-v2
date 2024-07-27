/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from 'ssh2';
import { join } from 'path';

export const getDatabaseConfig = async (
  configService: ConfigService,
): Promise<DataSourceOptions> => {
  const sshClient = new Client();

  await new Promise<void>((resolve, reject) => {
    sshClient
      .on('ready', resolve)
      .on('error', reject)
      .connect({
        host: configService.get('SSH_HOST'),
        port: 22,
        username: configService.get('SSH_USERNAME'),
        privateKey: configService.get('SSH_PRIVATE_KEY'),
      });
  });

  await new Promise<void>((resolve, reject) => {
    sshClient.forwardOut(
      '127.0.0.1',
      0,
      configService.get('POSTGRES_HOST'),
      configService.get('POSTGRES_PORT'),
      (err, stream) => {
        if (err) reject(err);
        resolve();
      },
    );
  });

  return {
    type: 'postgres',
    host: '127.0.0.1', // Conectamos al túnel SSH local
    port: 0, // El puerto se asignará dinámicamente por el túnel SSH
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [join(__dirname, '..', '..', '**', '*.entity{.ts,.js}')],
    migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'migrations_typeorm',
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    connectTimeoutMS: 60000,
  };
};
