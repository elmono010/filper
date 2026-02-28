# 🏁 GUÍA DEFINITIVA DE DESPLIEGUE (BORRADO Y CUENTA NUEVA)

Entiendo perfectamente la frustración. Vamos a hacer **borrón y cuenta nueva** para asegurar que no quede ninguna configuración "basura" en Dokploy. Sigue estos pasos exactamente en este orden.

---

## PASO 0: LIMPIEZA TOTAL
1.  Entra en Dokploy.
2.  **Elimina** las aplicaciones actuales de `filper-backend` y `filper-frontend`. (Esto libera los puertos y evita conflictos).
3.  Asegúrate de que la base de datos de PostgreSQL siga corriendo (no la borres).

---

## PASO 1: DESPLEGAR EL BACKEND (EL MOTOR) ⚙️
1.  **Crear App** en Dokploy (GitHub):
    *   Repository: `filper`
    *   Branch: `main`
    *   Build Path: `/backend`  (¡Importante!)
2.  **Variables de Entorno (Environment)**:
    *   `DATABASE_URL`: `postgresql://postgres:Elmono4823523103765506415031997Medellin55@filper-filperdb-2hzw43:5432/filper-db`
    *   `CORS_ORIGIN`: `https://silkroad-ao.xyz,https://www.silkroad-ao.xyz` (O usa `*` para permitir todo)
    *   `PORT`: `4000`
    *   `JWT_SECRET`: `b7d8f92e4a1c6b5d3f0e872a9c4b1d6f5a3e0b82d4c9f1a7b6e5d3c0a2f4e8b1`
    *   `NIXPACKS_NODE_VERSION`: `20`
3.  **Dominio y Puerto (Domains)**:
    *   Host: `api.silkroad-ao.xyz`
    *   Port: **4000**  (⚠️ SI ESTO ESTÁ EN 3000 SALDRÁ "BAD GATEWAY")
    *   **HTTPS**: ACTIVADO (Interruptor verde)
4.  **Desplegar**: Dale a Deploy.
5.  **Verificación**: Una vez termine, entra a `https://api.silkroad-ao.xyz`. Deberías ver: **"FILPER API IS ONLINE 🚀"**.

---

## PASO 2: DESPLEGAR EL FRONTEND (LA INTERFAZ) 🎨
1.  **Crear App** en Dokploy (GitHub):
    *   Repository: `filper`
    *   Branch: `main`
    *   Build Path: `/frontend` (¡Importante!)
2.  **Variables de Entorno (Environment)**:
    *   `NEXT_PUBLIC_API_URL`: `https://api.silkroad-ao.xyz` (⚠️ DEBE TENER HTTPS)
    *   `NIXPACKS_NODE_VERSION`: `20`
3.  **Dominio y Puerto (Domains)**:
    *   Host: `silkroad-ao.xyz`
    *   Port: **3000**
    *   **HTTPS**: ACTIVADO (Interruptor verde)
4.  **Desplegar**: Dale a Deploy.

---

## 🚀 ¿POR QUÉ FALLABA ANTES?
1.  **Prisma 7**: La versión 7 de Prisma cambió cómo se conecta a la DB. Ya he actualizado el código para usar el **Postgres Adapter**, que es el estándar ahora.
2.  **Bad Gateway**: Esto pasaba porque el servidor moría al intentar conectar a la DB sin el adaptador o porque el puerto en Dokploy no coincidía con el código (4000).
3.  **CORS**: Al caerse el código, no se enviaban los permisos al navegador.

**Sigue esta guía y hoy tendrás la web funcionando al 100%.**
