import { supabase } from './supabaseClient'

// Public, read-only. Allowed by the "public read" RLS policies on
// frases/autores — no token needed.
export async function listFrasesPublicas() {
  const { data, error } = await supabase
    .from('frases')
    .select('id, frase, metadata, semestre, autores(nombre, tipo)')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Flatten to the shape FraseCard already expects.
  return data.map(f => ({
    frase: f.frase,
    metadata: f.metadata,
    autor: f.autores?.nombre ?? 'Desconocido',
    tipo: f.autores?.tipo ?? 'alumno',
    semestre: f.semestre,
  }))
}

export async function listMiembrosPublicos() {
  const { data, error } = await supabase
    .from('miembros')
    .select('nombre, apodo, descripcion, imagen')
    .order('nombre')
  if (error) throw error
  return data
}
