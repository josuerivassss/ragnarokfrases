import { useState } from 'react'
import Select from '../../components/admin/Select'
import formStyles from './FraseForm.module.css'
import PasswordInput from '../../components/admin/PasswordInput'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin — CRUD frases y autores' },
  { value: 'owner', label: 'Owner — además, CRUD de admins' },
]

export default function AdminForm({ admin, onSave, onCancel, onDelete, busy, currentUsername }) {
  const [username, setUsername] = useState(admin?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(admin?.role ?? 'admin')
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    const u = username.trim()
    if (u.length < 3 || u.length > 40) e.username = 'Entre 3 y 40 caracteres'
    else if (!/^[a-zA-Z0-9_.-]+$/.test(u)) e.username = 'Solo letras, números, punto, guion y guion bajo'
    if (!admin && password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (admin && password && password.length < 8) e.password = 'Mínimo 8 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    onSave({ id: admin?.id, username: username.trim(), password, role })
  }

  const isSelf = admin && admin.username === currentUsername

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h2 className={formStyles.title}>{admin ? 'Editar admin' : 'Nuevo admin'}</h2>

      <label className={formStyles.label}>
        Usuario
        <input className={formStyles.input} value={username} onChange={e => setUsername(e.target.value)} maxLength={40} autoFocus />
        {errors.username && <span className={formStyles.error}>{errors.username}</span>}
      </label>

      <label className={formStyles.label}>
        {admin ? 'Nueva contraseña (dejar vacío para no cambiarla)' : 'Contraseña'}
        <PasswordInput
          className={formStyles.input}
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        {errors.password && <span className={formStyles.error}>{errors.password}</span>}
      </label>

      <label className={formStyles.label}>
        Rol
        <Select value={role} onChange={setRole} options={ROLE_OPTIONS} disabled={isSelf} />
        {isSelf && <span className={formStyles.error}>No puedes cambiar tu propio rol</span>}
      </label>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.cancelBtn} onClick={onCancel} disabled={busy}>Cancelar</button>
        {admin && !isSelf && (
          <button type="button" className={formStyles.deleteBtn} onClick={() => onDelete(admin.id)} disabled={busy}>
            Eliminar
          </button>
        )}
        <button type="submit" className={formStyles.saveBtn} disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  )
}