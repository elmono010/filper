# 🚀 ARCHIVO MAESTRO DE DESPLIEGUE - FILPER

Este archivo contiene la configuración final y probada para desplegar FILPER en tu VPS con Dokploy. He simplificado la arquitectura para asegurar que no haya fallos de conexión ni de CORS.

---

## 1. PREPARACIÓN DE DNS
En tu panel de dominio (`silkroad-ao.xyz`), crea estos registros:
- **A** `filper` ➔ `154.38.186.79`
- **A** `api` ➔ `154.38.186.79`

---

## 2. DESPLIEGUE DEL BACKEND (API)
1. **Crear App** en Dokploy:
   - Repo: `filper`
   - Branch: `main`
   - Build Path: `/backend`
2. **Variables de Entorno (Environment)**:
   - `DATABASE_URL`: `postgresql://postgres:Elmono... @filper-filperdb-2hzw43:5432/filper-db`
   - `PORT`: `4000`
   - `JWT_SECRET`: (Tu clave secreta)
   - `NIXPACKS_NODE_VERSION`: `20`
3. **Dominio (Domains)**:
   - Host: `api.silkroad-ao.xyz`
   - Container Port: `4000`
   - **HTTPS**: ACTIVADO (Interruptor en verde)
4. **Desplegar**: Dale a Deploy.

---

## 3. DESPLIEGUE DEL FRONTEND (APP)
1. **Crear App** en Dokploy:
   - Repo: `filper`
   - Branch: `main`
   - Build Path: `/frontend`
2. **Variables de Entorno (Environment)**:
   - `NEXT_PUBLIC_API_URL`: `https://api.silkroad-ao.xyz` (¡Debe tener https!)
   - `NIXPACKS_NODE_VERSION`: `20`
3. **Dominio (Domains)**:
   - Host: `silkroad-ao.xyz` (o `filper.silkroad-ao.xyz`)
   - Container Port: `3000`
   - **HTTPS**: ACTIVADO (Interruptor en verde)
4. **Desplegar**: Dale a Deploy.

---

## 🔍 SOLUCIÓN DE PROBLEMAS (CORS / PRISMA)
- **Error de Prisma**: He corregido el código para que use el estándar de Prisma 7. Asegúrate de que la `DATABASE_URL` en Dokploy sea correcta.
- **Error de CORS**: El backend ahora acepta dinámicamente cualquier petición de tus dominios. Si falla, asegúrate de que el Frontend esté enviando a `https://api.silkroad-ao.xyz` (con **https**).
- **Logs**: Si algo falla, mira los logs de Dokploy. Deberías ver `FILPER Backend running on port 4000`.

---
*Archivo generado automáticamente para la estabilización de FILPER.*
