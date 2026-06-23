import styles from './FraseCard.module.css'

// Maps semestre (1–10+) to a position along cyan→green gradient
function semesterColor(semestre, maxSemestre) {
  const ratio = Math.min((semestre - 1) / Math.max(maxSemestre - 1, 1), 1)
  // Interpolate between cyan (#22D3EE) and green (#4ADE80)
  const r = Math.round(0x22 + (0x4A - 0x22) * ratio)
  const g = Math.round(0xD3 + (0xDE - 0xD3) * ratio)
  const b = Math.round(0xEE + (0x80 - 0xEE) * ratio)
  return `rgb(${r},${g},${b})`
}

export default function FraseCard({ frase, metadata, autor, tipo, semestre, maxSemestre }) {
  const accentColor = semesterColor(semestre, maxSemestre)

  return (
    <article className={styles.card}>
      <div className={styles.accent} style={{ background: accentColor }} />
      <div className={styles.body}>
        <p className={styles.frase}>"{frase}"</p>
        {metadata && (
          <p className={styles.metadata}>{metadata}</p>
        )}
        <footer className={styles.footer}>
          <div className={styles.autor}>
            <span
              className={styles.tipoTag}
              style={{ color: tipo === 'maestro' ? 'var(--green)' : 'var(--cyan)' }}
            >
              <b>({tipo})</b>
            </span>
            <span className={styles.autorName}>— {autor}</span>
          </div>
          <span className={styles.semestre}>{semestre}°sem</span>
        </footer>
      </div>
    </article>
  )
}
