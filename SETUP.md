# Setup: Supabase + Panel de administración

## 1. Instalar dependencias

```bash
npm install @supabase/supabase-js react-router-dom
npm install -D dotenv
```

`dotenv` solo se usa en `scripts/migrate-frases.mjs` (fuera del bundle del navegador).
No necesitas `bcrypt` en el cliente — el hashing de contraseñas pasa por completo
dentro de Postgres (`pgcrypto`), nunca en el navegador.

## 2. Variables de entorno

Copia `.env.example` a `.env` y llena los tres valores. `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` los encuentras en Supabase → Project Settings → API.
`SUPABASE_SERVICE_ROLE_KEY` está en la misma página — **es secreta**, solo la
usa el script de migración desde tu máquina, jamás debe llegar al navegador.

## 3. Ejecutar el esquema

Pega el contenido de `supabase/schema.sql` en el SQL Editor de tu proyecto
Supabase y ejecútalo. Esto crea las tablas, activa Row Level Security y crea
todas las funciones RPC.

Al final del archivo hay un bloque comentado para crear tu primer owner
manualmente:

```sql
insert into admins(username, password_hash, role)
  values ('tu_usuario', crypt('tu_password_segura', gen_salt('bf')), 'owner');
```

Descoméntalo, pon tu usuario/contraseña reales, ejecútalo una vez, y luego
puedes volver a comentarlo (o borrarlo) — ya no lo necesitas porque una vez
que tengas un owner, puedes crear el resto de las cuentas desde `/panel/admins`.

## 4. Migrar frases.json

```bash
node scripts/migrate-frases.mjs
```

Esto crea un `autor` por cada nombre único en `frases.json` y luego inserta
todas las frases relacionadas a su autor correspondiente.

## 5. Ejecutar la app

```bash
npm run dev
```

- `/` — sitio público, sin cambios.
- `/panel/login` — inicio de sesión del panel.
- `/panel/frases`, `/panel/autores` — admin y owner.
- `/panel/admins` — solo owner.

## Cómo funciona la seguridad (léelo antes de usarlo en producción)

No se usa Supabase Auth ni Edge Functions, como pediste. En su lugar:

- La tabla `admins` tiene RLS activado **sin ninguna policy**, así que
  PostgREST (y por lo tanto el anon key del navegador) no puede leerla ni
  escribirla directamente, bajo ninguna circunstancia.
- El login (`admin_login`) es una función de Postgres `SECURITY DEFINER`:
  corre con privilegios elevados *dentro* de la base de datos, compara la
  contraseña con `crypt()`, y si es válida, crea una fila en `admin_sessions`
  y devuelve un token (UUID). Ese token se guarda en `localStorage` del
  navegador.
- Cada operación de escritura (crear/editar/borrar frase, autor o admin) es
  también una función `SECURITY DEFINER` que recibe ese token, valida que
  exista una sesión vigente y el rol correcto, y solo entonces toca la tabla.
  El cliente nunca llama `insert`/`update`/`delete` directo sobre las tablas.
- Como todas las llamadas van por `supabase.rpc(...)` con parámetros, no hay
  forma de inyectar SQL desde el formulario: el texto de la frase nunca se
  concatena en una consulta, se pasa como parámetro tipado.

**Limitaciones que debes conocer:**
- El token vive en `localStorage`. Si tu sitio público tuviera alguna
  vulnerabilidad de XSS, ese token podría robarse (igual que pasaría con una
  cookie no-httpOnly). Evita `dangerouslySetInnerHTML` en cualquier parte del
  sitio y mantén las dependencias actualizadas.
- No hay límite de intentos de login más allá de un pequeño retraso en
  usuarios inexistentes. Si te preocupa el fuerza bruta, lo más simple es
  activar el rate limiting de Supabase a nivel de proyecto, o agregar una
  tabla de intentos fallidos con bloqueo temporal — puedo ayudarte a
  agregarla si la quieres.
- Los tokens expiran a las 12 horas (columna `expires_at`); ajusta el
  intervalo en `schema.sql` si quieres otra duración.
