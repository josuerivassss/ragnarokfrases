import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { listFrases, listAutores, saveFrase, deleteFrase } from '../../lib/adminApi'
import Modal from '../../components/admin/Modal'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import FraseForm from './FraseForm'
import styles from './FrasesAdminPage.module.css'

export default function FrasesAdminPage() {
  const [frases, setFrases] = useState([])
  const [autores, setAutores] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(undefined) // undefined = cerrado, null = nueva, objeto = editar
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function reload() {
    setLoading(true)
    try {
      const [f, a] = await Promise.all([listFrases(), listAutores()])
      setFrases(f)
      setAutores(a)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const frasesFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return frases
    return frases.filter(f => f.frase.toLowerCase().includes(q))
  }, [frases, search])

  async function handleSave(payload) {
    setBusy(true)
    setError('')
    try {
      await saveFrase(payload)
      setEditing(undefined)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function requestDelete(id) {
    setDeleteTarget(id)
  }

  async function confirmDelete() {
    setBusy(true)
    setError('')
    try {
      await deleteFrase(deleteTarget)
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
        <h1 className={styles.title}>Frases</h1>
        <button className={styles.newBtn} onClick={() => setEditing(null)}>+ Nueva frase</button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Buscar por contenido de la frase…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)}>
        {autores.length > 0 ? (
          <FraseForm
            frase={editing}
            autores={autores}
            busy={busy}
            onSave={handleSave}
            onDelete={requestDelete}
            onCancel={() => setEditing(undefined)}
          />
        ) : (
          <p className={styles.error}>Crea al menos un autor antes de agregar frases.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar frase"
        message="¿Seguro que quieres eliminar esta frase? Esta acción no se puede deshacer."
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading ? (
        <p className={styles.hint}>Cargando…</p>
      ) : frasesFiltradas.length === 0 ? (
        <p className={styles.hint}>{search ? 'Sin resultados para tu búsqueda.' : 'Sin frases todavía.'}</p>
      ) : (
        <ul className={styles.list}>
          {frasesFiltradas.map(f => (
            <li key={f.id} className={styles.row}>
              <button className={styles.rowMain} onClick={() => setEditing(f)}>
                <p className={styles.frase}>"{f.frase}"</p>
                <p className={styles.meta}>
                  {f.autores?.nombre ?? 'Autor eliminado'} · {f.semestre}°sem
                  {f.metadata ? ` · ${f.metadata}` : ''}
                </p>
              </button>
              <button
                className={styles.deleteIcon}
                title="Eliminar frase"
                aria-label="Eliminar frase"
                onClick={() => requestDelete(f.id)}
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