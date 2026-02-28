// Reemplazado a .js para evitar errores de IDE con el entorno de TS
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
});
