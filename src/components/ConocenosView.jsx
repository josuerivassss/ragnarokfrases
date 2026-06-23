import data from '../assets/miembros.json'
import MiembroCard from './MiembroCard'
import styles from './ConocenosView.module.css'

export default function ConocenosView() {
  return (
    <main className={styles.wrapper}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Miembros de RK:</h1>
        <p className={styles.subtitle}>las mentes maestras detras de estas frases</p>
      </div>
      <div className={styles.grid}>
        {data.miembros.map((m, i) => (
          <MiembroCard key={i} {...m} />
        ))}
      </div>
    </main>
  )
}