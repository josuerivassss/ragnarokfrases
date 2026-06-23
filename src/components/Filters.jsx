import styles from './Filters.module.css'

export default function Filters({ semestres, filters, onChange, total }) {
  return (
    <section className={styles.filters}>
      <div className={styles.inner}>

        <div className={styles.left}>
          {/* Tipo */}
          <div className={styles.group}>
            <span className={styles.label}>tipo</span>
            <div className={styles.pills}>
              {['todos', 'alumno', 'maestro'].map(t => (
                <button
                  key={t}
                  className={`${styles.pill} ${filters.tipo === t ? styles.active : ''}`}
                  onClick={() => onChange({ ...filters, tipo: t })}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Semestre */}
          <div className={styles.group}>
            <span className={styles.label}>semestre</span>
            <div className={styles.pills}>
              <button
                className={`${styles.pill} ${filters.semestre === 'todos' ? styles.active : ''}`}
                onClick={() => onChange({ ...filters, semestre: 'todos' })}
              >
                todos
              </button>
              {semestres.map(s => (
                <button
                  key={s}
                  className={`${styles.pill} ${filters.semestre === s ? styles.active : ''}`}
                  onClick={() => onChange({ ...filters, semestre: s })}
                >
                  {s}°
                </button>
              ))}
            </div>
          </div>
        </div>

        <span className={styles.counter}>
          <span className={styles.counterNum}>{total}</span>
          <span className={styles.counterLabel}>frases</span>
        </span>

      </div>
    </section>
  )
}