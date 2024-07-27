import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Objeto de configuración para la conexión a PostgreSQL utilizando variables de entorno
const dbConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT, 10), // convierte la cadena a número
};

// Crear una nueva instancia de Pool
const pool = new Pool(dbConfig);

// Exportar la instancia de Pool para ser usada en otras partes de la aplicación
export default pool;
