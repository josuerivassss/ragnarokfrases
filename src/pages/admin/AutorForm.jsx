import { useState } from 'react'
import Select from '../../components/admin/Select'
import formStyles from './FraseForm.module.css'

const TIPO_OPTIONS = [
  { value: 'alumno', label: 'Alumno' },
  { value: 'maestro', label: 'Maestro' },
]

export default function AutorForm({ autor, onSave, onCancel, onDelete, busy }) {
  const [nombre, setNombre] = useState(autor?.nombre ?? '')
  const [apodo, setApodo] = useState(autor?.apodo ?? '')
  const [tipo, setTipo] = useState(autor?.tipo ?? 'alumno')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length > 80) e.nombre = 'Máximo 80 caracteres'
    if (apodo.trim().length > 40) e.apodo = 'Máximo 40 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSave({ id: autor?.id, nombre: nombre.trim(), apodo: apodo.trim(), tipo })
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h2 className={formStyles.title}>{autor ? 'Editar autor' : 'Nuevo autor'}</h2>

      <label className={formStyles.label}>
        Nombre
        <input className={formStyles.input} value={nombre} onChange={e => setNombre(e.target.value)} maxLength={80} autoFocus />
        {errors.nombre && <span className={formStyles.error}>{errors.nombre}</span>}
      </label>

      <label className={formStyles.label}>
        Apodo (opcional)
        <input className={formStyles.input} value={apodo} onChange={e => setApodo(e.target.value)} maxLength={40} />
        {errors.apodo && <span className={formStyles.error}>{errors.apodo}</span>}
      </label>

      <label className={formStyles.label}>
        Tipo
        <Select value={tipo} onChange={setTipo} options={TIPO_OPTIONS} />
      </label>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onCancel} disabled={busy}>Cancelar</button>
        {autor && (
          <button type="button" className={formStyles.deleteBtn} onClick={() => onDelete(autor.id)} disabled={busy}>
            Eliminar
          </button>
        )}
        <button type="submit" className={formStyles.saveBtn} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  )
}