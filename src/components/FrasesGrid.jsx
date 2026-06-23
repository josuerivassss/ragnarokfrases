import FraseCard from './FraseCard'
import styles from './FrasesGrid.module.css'

export default function FrasesGrid({ frases, maxSemestre }) {
  if (frases.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>∅</span>
        <p>No hay frases con esos filtros.</p>
      </div>
    )
  }

  return (
    <main className={styles.grid}>
      {frases.map((f, i) => (
        <FraseCard key={i} {...f} maxSemestre={maxSemestre} />
      ))}
    </main>
  )
}
