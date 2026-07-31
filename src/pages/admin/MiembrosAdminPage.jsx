import { useEffect, useState } from 'react'
import { listMiembros, saveMiembro, deleteMiembro } from '../../lib/adminApi'
import MiembroForm from './MiembroForm'
import styles from './FrasesAdminPage.module.css'

export default function MiembrosAdminPage() {
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function reload() {
    setLoading(true)
    try {
      setMiembros(await listMiembros())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  async function handleSave(payload) {
    setBusy(true); setError('')
    try {
      await saveMiembro(payload)
      setEditing(undefined)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este miembro?')) return
    setBusy(true); setError('')
    try {
      await deleteMiembro(id)
      setEditing(undefined)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Miembros</h1>
        {editing === undefined && (
          <button className={styles.newBtn} onClick={() => setEditing(null)}>+ Nuevo miembro</button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {editing !== undefined && (
        <MiembroForm
          miembro={editing}
          busy={busy}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setEditing(undefined)}
        />
      )}

      {loading ? (
        <p className={styles.hint}>Cargando…</p>
      ) : miembros.length === 0 ? (
        <p className={styles.hint}>Sin miembros todavía.</p>
      ) : (
        <ul className={styles.list}>
          {miembros.map(m => (
            <li key={m.id} className={styles.row}>
              <button className={styles.rowMain} onClick={() => setEditing(m)}>
                <p className={styles.frase}>{m.nombre}{m.apodo ? ` · "${m.apodo}"` : ''}</p>
                {m.descripcion && <p className={styles.meta}>{m.descripcion}</p>}
              </button>
              <button
                className={styles.deleteIcon}
                title="Eliminar miembro"
                aria-label="Eliminar miembro"
                onClick={() => handleDelete(m.id)}
                disabled={busy}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
