import { supabase } from './supabaseClient'

const SESSION_KEY = 'rk_admin_session'

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
}

// ---------- AUTH ----------

export async function login(username, password) {
  const { data, error } = await supabase
    .rpc('admin_login', { p_username: username, p_password: password })
    .single()

  if (error || !data?.token) {
    throw new Error('Usuario o contraseña incorrectos')
  }
  const session = { token: data.token, role: data.role, username: data.username }
  storeSession(session)
  return session
}

export async function logout() {
  const session = getStoredSession()
  if (session) {
    await supabase.rpc('admin_logout', { p_token: session.token })
  }
  clearStoredSession()
}

// Confirms the stored token is still valid server-side (call on app load).
export async function verifySession() {
  const session = getStoredSession()
  if (!session) return null
  const { data, error } = await supabase
    .rpc('admin_whoami', { p_token: session.token })
    .single()
  if (error || !data) {
    clearStoredSession()
    return null
  }
  return session
}

function requireToken() {
  const session = getStoredSession()
  if (!session) throw new Error('Sesión expirada, vuelve a iniciar sesión')
  return session.token
}

// ---------- FRASES ----------

export async function listFrases() {
  const { data, error } = await supabase
    .from('frases')
    .select('id, frase, metadata, semestre, autor_id, autores(nombre, tipo)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveFrase({ id, frase, metadata, autorId, semestre }) {
  const { data, error } = await supabase.rpc('frase_upsert', {
    p_token: requireToken(),
    p_id: id ?? null,
    p_frase: frase,
    p_metadata: metadata || null,
    p_autor_id: autorId,
    p_semestre: semestre,
  })
  if (error) throw error
  return data
}

export async function deleteFrase(id) {
  const { error } = await supabase.rpc('frase_delete', { p_token: requireToken(), p_id: id })
  if (error) throw error
}

// ---------- AUTORES ----------

export async function listAutores() {
  const { data, error } = await supabase.from('autores').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function saveAutor({ id, nombre, apodo, tipo }) {
  const { data, error } = await supabase.rpc('autor_upsert', {
    p_token: requireToken(),
    p_id: id ?? null,
    p_nombre: nombre,
    p_apodo: apodo || null,
    p_tipo: tipo,
  })
  if (error) throw error
  return data
}

export async function deleteAutor(id) {
  const { error } = await supabase.rpc('autor_delete', { p_token: requireToken(), p_id: id })
  if (error) throw error
}

// ---------- MIEMBROS ----------

export async function listMiembros() {
  const { data, error } = await supabase.from('miembros').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function saveMiembro({ id, nombre, apodo, descripcion, imagen }) {
  const { data, error } = await supabase.rpc('miembro_upsert', {
    p_token: requireToken(),
    p_id: id ?? null,
    p_nombre: nombre,
    p_apodo: apodo || null,
    p_descripcion: descripcion || null,
    p_imagen: imagen || null,
  })
  if (error) throw error
  return data
}

export async function deleteMiembro(id) {
  const { error } = await supabase.rpc('miembro_delete', { p_token: requireToken(), p_id: id })
  if (error) throw error
}

// ---------- ADMINS (owner only) ----------

export async function listAdmins() {
  const { data, error } = await supabase.rpc('admin_list', { p_token: requireToken() })
  if (error) throw error
  return data
}

export async function saveAdmin({ id, username, password, role }) {
  const { data, error } = await supabase.rpc('admin_upsert', {
    p_token: requireToken(),
    p_id: id ?? null,
    p_username: username,
    p_password: password || null,
    p_role: role,
  })
  if (error) throw error
  return data
}

export async function deleteAdmin(id) {
  const { error } = await supabase.rpc('admin_delete', { p_token: requireToken(), p_id: id })
  if (error) throw error
}
