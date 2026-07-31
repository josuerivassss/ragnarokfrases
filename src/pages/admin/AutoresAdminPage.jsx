import { useEffect, useState } from 'react'
import { listAutores, saveAutor, deleteAutor } from '../../lib/adminApi'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import AutorForm from './AutorForm'
import styles from './FrasesAdminPage.module.css'

export default function AutoresAdminPage() {
  const [autores, setAutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function reload() {
    setLoading(true)
    try {
      setAutores(await listAutores())
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
      await saveAutor(payload)
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
      await deleteAutor(deleteTarget)
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
        <h1 className={styles.title}>Autores</h1>
        <button className={styles.newBtn} onClick={() => setEditing(null)}>+ Nuevo autor</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)}>
        <AutorForm
          autor={editing}
          busy={busy}
          onSave={handleSave}
          onDelete={id => setDeleteTarget(id)}
          onCancel={() => setEditing(undefined)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar autor"
        message="¿Seguro que quieres eliminar este autor?"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading ? (
        <p className={styles.hint}>Cargando…</p>
      ) : autores.length === 0 ? (
        <p className={styles.hint}>Sin autores todavía.</p>
      ) : (
        <ul className={styles.list}>
          {autores.map(a => (
            <li key={a.id} className={styles.row}>
              <button className={styles.rowMain} onClick={() => setEditing(a)}>
                <p className={styles.frase}>{a.nombre}{a.apodo ? ` · "${a.apodo}"` : ''}</p>
                <p className={styles.meta}>{a.tipo}</p>
              </button>
              <button
                className={styles.deleteIcon}
                title="Eliminar autor"
                aria-label="Eliminar autor"
                onClick={() => setDeleteTarget(a.id)}
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