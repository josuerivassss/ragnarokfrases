import { useEffect, useState } from 'react'
import { listMiembros, saveMiembro, deleteMiembro } from '../../lib/adminApi'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import MiembroForm from './MiembroForm'
import styles from './FrasesAdminPage.module.css'

export default function MiembrosAdminPage() {
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
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

  async function confirmDelete() {
    setBusy(true); setError('')
    try {
      await deleteMiembro(deleteTarget)
      setDeleteTarget(null)
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
        <button className={styles.newBtn} onClick={() => setEditing(null)}>+ Nuevo miembro</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)}>
        <MiembroForm
          miembro={editing}
          busy={busy}
          onSave={handleSave}
          onDelete={id => setDeleteTarget(id)}
          onCancel={() => setEditing(undefined)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar miembro"
        message="¿Seguro que quieres eliminar este miembro?"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

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
                onClick={() => setDeleteTarget(m.id)}
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