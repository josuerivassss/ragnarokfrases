import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Select.module.css'

export default function Select({ value, onChange, options, placeholder = 'Selecciona…', disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>

      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map(o => (
            <li key={o.value}>
              <button
                type="button"
                className={`${styles.option} ${o.value === value ? styles.optionActive : ''}`}
                onClick={() => { onChange(o.value); setOpen(false) }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}