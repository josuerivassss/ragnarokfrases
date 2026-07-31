import { useState } from 'react'
import formStyles from './FraseForm.module.css'

export default function MiembroForm({ miembro, onSave, onCancel, onDelete, busy }) {
  const [nombre, setNombre] = useState(miembro?.nombre ?? '')
  const [apodo, setApodo] = useState(miembro?.apodo ?? '')
  const [descripcion, setDescripcion] = useState(miembro?.descripcion ?? '')
  const [imagen, setImagen] = useState(miembro?.imagen ?? '')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length > 80) e.nombre = 'Máximo 80 caracteres'
    if (apodo.trim().length > 40) e.apodo = 'Máximo 40 caracteres'
    if (descripcion.trim().length > 300) e.descripcion = 'Máximo 300 caracteres'
    if (imagen.trim() && !/^https?:\/\/.+/.test(imagen.trim())) e.imagen = 'Debe ser una URL http(s) válida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSave({
      id: miembro?.id,
      nombre: nombre.trim(),
      apodo: apodo.trim(),
      descripcion: descripcion.trim(),
      imagen: imagen.trim(),
    })
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h2 className={formStyles.title}>{miembro ? 'Editar miembro' : 'Nuevo miembro'}</h2>

      <label className={formStyles.label}>
        Nombre
        <input className={formStyles.input} value={nombre} onChange={e => setNombre(e.target.value)} maxLength={80} />
        {errors.nombre && <span className={formStyles.error}>{errors.nombre}</span>}
      </label>

      <label className={formStyles.label}>
        Apodo (opcional)
        <input className={formStyles.input} value={apodo} onChange={e => setApodo(e.target.value)} maxLength={40} />
        {errors.apodo && <span className={formStyles.error}>{errors.apodo}</span>}
      </label>

      <label className={formStyles.label}>
        Descripción
        <textarea
          className={formStyles.textarea}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          maxLength={300}
          rows={3}
        />
        <span className={formStyles.counter}>{descripcion.length}/300</span>
        {errors.descripcion && <span className={formStyles.error}>{errors.descripcion}</span>}
      </label>

      <label className={formStyles.label}>
        URL de imagen (opcional)
        <input className={formStyles.input} value={imagen} onChange={e => setImagen(e.target.value)} placeholder="https://..." />
        {errors.imagen && <span className={formStyles.error}>{errors.imagen}</span>}
      </label>

      <div className={formStyles.preview}>
        <span className={formStyles.previewLabel}>Preview</span>
        <p className={formStyles.previewFrase}>{nombre.trim() || '…'}</p>
        {apodo.trim() && <p className={formStyles.previewMeta}>"{apodo.trim()}"</p>}
        {descripcion.trim() && <p className={formStyles.previewFooter}>{descripcion.trim()}</p>}
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onCancel} disabled={busy}>Cancelar</button>
        {miembro && (
          <button type="button" className={formStyles.deleteBtn} onClick={() => onDelete(miembro.id)} disabled={busy}>
            Eliminar
          </button>
        )}
        <button type="submit" className={formStyles.saveBtn} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  )
}
