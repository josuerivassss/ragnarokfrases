import Modal from './Modal'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel, busy }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className={styles.box}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={busy}>Cancelar</button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={busy}>
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}