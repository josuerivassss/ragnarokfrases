import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Modal from './Modal'
import styles from './CredentialsModal.module.css'

export default function CredentialsModal({ open, onClose, credentials }) {
  const [copied, setCopied] = useState(false)

  if (!credentials) return null

  const panelUrl = `${window.location.origin}/panel`
  const texto = `Usuario: ${credentials.username}\nContraseña: ${credentials.password}\n\nPanel: ${panelUrl}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard API bloqueada (ej. http sin TLS) — no hacemos nada más
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.box}>
        <h3 className={styles.title}>Credenciales</h3>
        <p className={styles.hint}>
          Guarda o comparte esto ahora — la contraseña no se puede volver a mostrar después.
        </p>

        <div className={styles.codeWrap}>
          <pre className={styles.code}>{texto}</pre>
          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
            onClick={handleCopy}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.closeBtn} onClick={onClose}>Listo</button>
        </div>
      </div>
    </Modal>
  )
}