-- ============================================================
-- Frases de Ragnarok — schema, RLS, and RPC functions
-- Run this once in the Supabase SQL editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- TABLES ----------

create table if not exists autores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 80),
  apodo text check (apodo is null or char_length(apodo) <= 40),
  tipo text not null check (tipo in ('alumno', 'maestro')),
  created_at timestamptz not null default now()
);

create table if not exists frases (
  id uuid primary key default gen_random_uuid(),
  frase text not null check (char_length(frase) between 1 and 500),
  metadata text check (metadata is null or char_length(metadata) <= 300),
  autor_id uuid not null references autores(id) on delete restrict,
  semestre smallint not null check (semestre between 1 and 12),
  created_at timestamptz not null default now()
);

-- Custom admin accounts. NEVER exposed directly to the client (no RLS policies = no direct access).
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null check (char_length(username) between 3 and 40),
  password_hash text not null,
  role text not null check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);

-- Login sessions issued by admin_login(). Also never exposed directly.
create table if not exists admin_sessions (
  token uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  username text not null,
  role text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '12 hours'
);

-- ---------- ROW LEVEL SECURITY ----------

alter table autores enable row level security;
alter table frases enable row level security;
alter table admins enable row level security;
alter table admin_sessions enable row level security;

-- Public (anon) can only ever READ frases/autores. All writes go through the
-- SECURITY DEFINER functions below, which check a session token themselves.
create policy "public read frases" on frases for select using (true);
create policy "public read autores" on autores for select using (true);

-- No policies at all on admins / admin_sessions => PostgREST cannot read or
-- write them directly with the anon key, under any circumstance.

revoke insert, update, delete on frases from anon, authenticated;
revoke insert, update, delete on autores from anon, authenticated;
revoke all on admins from anon, authenticated;
revoke all on admin_sessions from anon, authenticated;

-- ---------- SESSION HELPER ----------

create or replace function _session_role(p_token uuid)
returns text
language sql security definer set search_path = public as $$
  select role from admin_sessions
  where token = p_token and expires_at > now();
$$;

-- ---------- AUTH RPCs ----------

create or replace function admin_login(p_username text, p_password text)
returns table(token uuid, role text, username text)
language plpgsql security definer set search_path = public as $$
declare
  v_admin admins%rowtype;
  v_token uuid;
begin
  select * into v_admin from admins where admins.username = p_username;
  if v_admin.id is null then
    perform pg_sleep(0.4); -- constant-ish time, avoid trivial username enumeration
    return;
  end if;
  if v_admin.password_hash <> crypt(p_password, v_admin.password_hash) then
    return;
  end if;
  delete from admin_sessions where admin_id = v_admin.id and expires_at < now();
  insert into admin_sessions(admin_id, username, role)
    values (v_admin.id, v_admin.username, v_admin.role)
    returning admin_sessions.token into v_token;
  return query select v_token, v_admin.role, v_admin.username;
end;
$$;

create or replace function admin_logout(p_token uuid)
returns void
language sql security definer set search_path = public as $$
  delete from admin_sessions where token = p_token;
$$;

create or replace function admin_whoami(p_token uuid)
returns table(role text, username text)
language sql security definer set search_path = public as $$
  select role, username from admin_sessions
  where token = p_token and expires_at > now();
$$;

-- ---------- FRASES CRUD RPCs (admin or owner) ----------

create or replace function frase_upsert(
  p_token uuid, p_id uuid, p_frase text, p_metadata text, p_autor_id uuid, p_semestre int
) returns frases
language plpgsql security definer set search_path = public as $$
declare v_row frases%rowtype;
begin
  if _session_role(p_token) is null then
    raise exception 'No autorizado';
  end if;
  if p_id is null then
    insert into frases(frase, metadata, autor_id, semestre)
      values (p_frase, nullif(p_metadata, ''), p_autor_id, p_semestre)
      returning * into v_row;
  else
    update frases set
      frase = p_frase, metadata = nullif(p_metadata, ''),
      autor_id = p_autor_id, semestre = p_semestre
      where id = p_id
      returning * into v_row;
  end if;
  return v_row;
end;
$$;

create or replace function frase_delete(p_token uuid, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if _session_role(p_token) is null then
    raise exception 'No autorizado';
  end if;
  delete from frases where id = p_id;
end;
$$;

-- ---------- AUTORES CRUD RPCs (admin or owner) ----------

create or replace function autor_upsert(
  p_token uuid, p_id uuid, p_nombre text, p_apodo text, p_tipo text
) returns autores
language plpgsql security definer set search_path = public as $$
declare v_row autores%rowtype;
begin
  if _session_role(p_token) is null then
    raise exception 'No autorizado';
  end if;
  if p_tipo not in ('alumno', 'maestro') then
    raise exception 'Tipo invalido';
  end if;
  if p_id is null then
    insert into autores(nombre, apodo, tipo)
      values (p_nombre, nullif(p_apodo, ''), p_tipo)
      returning * into v_row;
  else
    update autores set nombre = p_nombre, apodo = nullif(p_apodo, ''), tipo = p_tipo
      where id = p_id
      returning * into v_row;
  end if;
  return v_row;
end;
$$;

create or replace function autor_delete(p_token uuid, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if _session_role(p_token) is null then
    raise exception 'No autorizado';
  end if;
  if exists (select 1 from frases where autor_id = p_id) then
    raise exception 'Este autor tiene frases asociadas; reasigna o elimina esas frases primero';
  end if;
  delete from autores where id = p_id;
end;
$$;

-- ---------- ADMINS CRUD RPCs (owner only) ----------

create or replace function admin_list(p_token uuid)
returns table(id uuid, username text, role text, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if _session_role(p_token) is distinct from 'owner' then
    raise exception 'No autorizado';
  end if;
  return query select admins.id, admins.username, admins.role, admins.created_at
    from admins order by admins.created_at;
end;
$$;

create or replace function admin_upsert(
  p_token uuid, p_id uuid, p_username text, p_password text, p_role text
) returns table(id uuid, username text, role text)
language plpgsql security definer set search_path = public as $$
begin
  if _session_role(p_token) is distinct from 'owner' then
    raise exception 'No autorizado';
  end if;
  if p_role not in ('admin', 'owner') then
    raise exception 'Rol invalido';
  end if;

  if p_id is null then
    if p_password is null or char_length(p_password) < 8 then
      raise exception 'La contrasena debe tener al menos 8 caracteres';
    end if;
    return query insert into admins(username, password_hash, role)
      values (p_username, crypt(p_password, gen_salt('bf')), p_role)
      returning admins.id, admins.username, admins.role;
  else
    if p_password is null or p_password = '' then
      return query update admins set username = p_username, role = p_role
        where admins.id = p_id
        returning admins.id, admins.username, admins.role;
    else
      if char_length(p_password) < 8 then
        raise exception 'La contrasena debe tener al menos 8 caracteres';
      end if;
      return query update admins set
          username = p_username, role = p_role,
          password_hash = crypt(p_password, gen_salt('bf'))
        where admins.id = p_id
        returning admins.id, admins.username, admins.role;
    end if;
  end if;
end;
$$;

create or replace function admin_delete(p_token uuid, p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if _session_role(p_token) is distinct from 'owner' then
    raise exception 'No autorizado';
  end if;
  delete from admins where id = p_id;
end;
$$;

-- ---------- GRANTS ----------
-- Anon may only ever call these functions; it can never touch admins/admin_sessions
-- or write frases/autores directly.

grant execute on function admin_login(text, text) to anon, authenticated;
grant execute on function admin_logout(uuid) to anon, authenticated;
grant execute on function admin_whoami(uuid) to anon, authenticated;
grant execute on function frase_upsert(uuid, uuid, text, text, uuid, int) to anon, authenticated;
grant execute on function frase_delete(uuid, uuid) to anon, authenticated;
grant execute on function autor_upsert(uuid, uuid, text, text, text) to anon, authenticated;
grant execute on function autor_delete(uuid, uuid) to anon, authenticated;
grant execute on function admin_list(uuid) to anon, authenticated;
grant execute on function admin_upsert(uuid, uuid, text, text, text) to anon, authenticated;
grant execute on function admin_delete(uuid, uuid) to anon, authenticated;

-- ---------- SEED YOUR FIRST OWNER MANUALLY ----------
-- Run this once yourself, with a real password, then delete/forget this block.
-- insert into admins(username, password_hash, role)
--   values ('tu_usuario', crypt('tu_password_segura', gen_salt('bf')), 'owner');
