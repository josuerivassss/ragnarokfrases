import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './PasswordInput.module.css'

export default function PasswordInput({ value, onChange, className, ...rest }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={styles.wrap}>
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={className}
        style={{ paddingRight: '2.25rem', width: '100%', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}