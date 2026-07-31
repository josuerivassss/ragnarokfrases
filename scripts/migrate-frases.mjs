// One-off migration: pushes src/assets/frases.json into Supabase.
// Run locally with:  node scripts/migrate-frases.mjs
//
// Needs a .env with:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (Service role key — Project Settings > API.
//                                        Only used here, never shipped to the browser.)

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import data from '../src/assets/frases.json' with { type: 'json' }

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en tu .env')
  process.exit(1)
}

// Service role bypasses RLS — that's fine, this script runs once on your machine, not in the browser.
const supabase = createClient(url, serviceKey)

async function run() {
  // 1. Collect unique autores from frases.json
  const autorNombres = [...new Set(data.frases.map(f => f.autor))]

  // If an autor appears with tipo 'maestro' anywhere, treat them as maestro overall.
  const tipoPorAutor = {}
  for (const f of data.frases) {
    if (!tipoPorAutor[f.autor] || f.tipo === 'maestro') tipoPorAutor[f.autor] = f.tipo
  }

  console.log(`Insertando ${autorNombres.length} autores...`)
  const { data: autoresInsertados, error: autoresErr } = await supabase
    .from('autores')
    .insert(autorNombres.map(nombre => ({ nombre, tipo: tipoPorAutor[nombre] })))
    .select()

  if (autoresErr) {
    console.error('Error insertando autores:', autoresErr)
    process.exit(1)
  }

  const idPorNombre = Object.fromEntries(autoresInsertados.map(a => [a.nombre, a.id]))

  console.log(`Insertando ${data.frases.length} frases...`)
  const rows = data.frases.map(f => ({
    frase: f.frase,
    metadata: f.metadata,
    autor_id: idPorNombre[f.autor],
    semestre: f.semestre,
  }))

  const { error: frasesErr } = await supabase.from('frases').insert(rows)

  if (frasesErr) {
    console.error('Error insertando frases:', frasesErr)
    process.exit(1)
  }

  console.log('Listo. Migración completa.')
}

run()
