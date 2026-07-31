import { useEffect, useState } from 'react'
import { listMiembrosPublicos } from '../lib/publicApi'
import MiembroCard from './MiembroCard'
import styles from './ConocenosView.module.css'

export default function ConocenosView() {
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listMiembrosPublicos()
      .then(setMiembros)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className={styles.wrapper}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Miembros de RK:</h1>
        <p className={styles.subtitle}>las mentes maestras detras de estas frases</p>
      </div>

      {error && <p style={{ color: '#f87171' }}>No se pudieron cargar los miembros: {error}</p>}
      {loading && !error && <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {miembros.map((m, i) => (
            <MiembroCard key={i} {...m} />
          ))}
        </div>
      )}
    </main>
  )
}
