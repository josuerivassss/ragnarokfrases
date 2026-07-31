// One-off migration: pushes src/assets/miembros.json into Supabase.
// Run locally with:  node scripts/migrate-miembros.mjs
// Needs the same .env as scripts/migrate-frases.mjs

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import data from '../src/assets/miembros.json' with { type: 'json' }

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en tu .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

async function run() {
  const rows = data.miembros.map(m => ({
    nombre: m.nombre,
    apodo: m.apodo || null,
    descripcion: m.descripcion || null,
    imagen: m.imagen || null,
  }))

  console.log(`Insertando ${rows.length} miembros...`)
  const { error } = await supabase.from('miembros').insert(rows)

  if (error) {
    console.error('Error insertando miembros:', error)
    process.exit(1)
  }

  console.log('Listo. Migración de miembros completa.')
}

run()
