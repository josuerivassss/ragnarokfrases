import { useState } from 'react'
import Select from '../../components/admin/Select'
import styles from './FraseForm.module.css'

const FRASE_MAX = 500
const METADATA_MAX = 300

export default function FraseForm({ frase, autores, onSave, onCancel, onDelete, busy }) {
  const [texto, setTexto] = useState(frase?.frase ?? '')
  const [metadata, setMetadata] = useState(frase?.metadata ?? '')
  const [autorId, setAutorId] = useState(frase?.autor_id ?? autores[0]?.id ?? '')
  const [semestre, setSemestre] = useState(frase?.semestre ?? 1)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    const t = texto.trim()
    if (!t) e.texto = 'La frase no puede estar vacía'
    else if (t.length > FRASE_MAX) e.texto = `Máximo ${FRASE_MAX} caracteres`
    if (metadata.trim().length > METADATA_MAX) e.metadata = `Máximo ${METADATA_MAX} caracteres`
    if (!autorId) e.autorId = 'Elige un autor'
    const sem = Number(semestre)
    if (!Number.isInteger(sem) || sem < 1 || sem > 12) e.semestre = 'Semestre entre 1 y 12'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSave({
      id: frase?.id,
      frase: texto.trim(),
      metadata: metadata.trim(),
      autorId,
      semestre: Number(semestre),
    })
  }

  const autorSeleccionado = autores.find(a => a.id === autorId)

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{frase ? 'Editar frase' : 'Nueva frase'}</h2>

      <label className={styles.label}>
        Frase
        <textarea
          className={styles.textarea}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          maxLength={FRASE_MAX}
          rows={3}
          autoFocus
        />
        <span className={styles.counter}>{texto.length}/{FRASE_MAX}</span>
        {errors.texto && <span className={styles.error}>{errors.texto}</span>}
      </label>

      <label className={styles.label}>
        Contexto / metadata (opcional)
        <input
          className={styles.input}
          value={metadata}
          onChange={e => setMetadata(e.target.value)}
          maxLength={METADATA_MAX}
        />
        {errors.metadata && <span className={styles.error}>{errors.metadata}</span>}
      </label>

      <div className={styles.row}>
        <label className={styles.label}>
          Autor
          <Select
            value={autorId}
            onChange={setAutorId}
            placeholder="Elige un autor"
            options={autores.map(a => ({ value: a.id, label: `${a.nombre} (${a.tipo})` }))}
          />
          {errors.autorId && <span className={styles.error}>{errors.autorId}</span>}
        </label>

        <label className={styles.label}>
          Semestre
          <input
            className={styles.input}
            type="number"
            min={1}
            max={12}
            value={semestre}
            onChange={e => setSemestre(e.target.value)}
          />
          {errors.semestre && <span className={styles.error}>{errors.semestre}</span>}
        </label>
      </div>

      <div className={styles.preview}>
        <span className={styles.previewLabel}>Preview</span>
        <p className={styles.previewFrase}>"{texto.trim() || '…'}"</p>
        {metadata.trim() && <p className={styles.previewMeta}>{metadata.trim()}</p>}
        <p className={styles.previewFooter}>
          — {autorSeleccionado?.nombre ?? '…'} · {semestre}°sem
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        {frase && (
          <button type="button" className={styles.deleteBtn} onClick={() => onDelete(frase.id)} disabled={busy}>
            Eliminar
          </button>
        )}
        <button type="submit" className={styles.saveBtn} disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}