import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

export default function Modal({ open, onClose, children }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={styles.panel} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>,
    document.body
  )
}