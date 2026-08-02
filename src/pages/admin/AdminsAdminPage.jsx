import { useEffect, useState } from 'react'
import { listAdmins, saveAdmin, deleteAdmin } from '../../lib/adminApi'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import CredentialsModal from '../../components/admin/CredentialsModal'
import AdminForm from './AdminForm'
import styles from './FrasesAdminPage.module.css'

export default function AdminsAdminPage() {
  const { session } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [newCredentials, setNewCredentials] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function reload() {
    setLoading(true)
    try {
      setAdmins(await listAdmins())
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
      await saveAdmin(payload)
      setEditing(undefined)
      // Solo mostramos el popup de credenciales si de verdad hubo contraseña
      // (creación nueva, o edición donde se escribió una contraseña nueva).
      if (payload.password) {
        setNewCredentials({ username: payload.username, password: payload.password })
      }
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
      await deleteAdmin(deleteTarget)
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
        <h1 className={styles.title}>Admins</h1>
        <button className={styles.newBtn} onClick={() => setEditing(null)}>+ Nuevo admin</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)}>
        <AdminForm
          admin={editing}
          busy={busy}
          currentUsername={session?.username}
          onSave={handleSave}
          onDelete={id => setDeleteTarget(id)}
          onCancel={() => setEditing(undefined)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar admin"
        message="¿Seguro? Esta persona perderá acceso al panel de inmediato."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <CredentialsModal
        open={newCredentials !== null}
        credentials={newCredentials}
        onClose={() => setNewCredentials(null)}
      />

      {loading ? (
        <p className={styles.hint}>Cargando…</p>
      ) : admins.length === 0 ? (
        <p className={styles.hint}>Sin admins todavía.</p>
      ) : (
        <ul className={styles.list}>
          {admins.map(a => (
            <li key={a.id} className={styles.row}>
              <button className={styles.rowMain} onClick={() => setEditing(a)}>
                <p className={styles.frase}>{a.username}</p>
                <p className={styles.meta}>{a.role}</p>
              </button>
              {a.username !== session?.username && (
                <button
                  className={styles.deleteIcon}
                  title="Eliminar admin"
                  aria-label="Eliminar admin"
                  onClick={() => setDeleteTarget(a.id)}
                  disabled={busy}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}