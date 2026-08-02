import { useMemo } from 'react'
import logo from '/rkq.png'
import styles from './LoadingScreen.module.css'

const QUOTE_COUNT = 14

// Posiciones fijas (no random en cada render) para que el layout no "salte"
function buildQuotes() {
  return Array.from({ length: QUOTE_COUNT }).map((_, i) => ({
    key: i,
    top: (i * 37) % 100,
    left: (i * 53) % 100,
    size: 1.4 + (i % 4) * 0.6,
    delay: (i % 7) * 0.6,
    duration: 8 + (i % 5) * 2,
  }))
}

export default function LoadingScreen({ duration = 4000 }) {
  const quotes = useMemo(buildQuotes, [])

  return (
    <div className={styles.screen} style={{ '--duration': `${duration}ms` }}>
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.pattern} aria-hidden="true">
        {quotes.map(q => (
          <span
            key={q.key}
            className={styles.quote}
            style={{
              top: `${q.top}%`,
              left: `${q.left}%`,
              fontSize: `${q.size}rem`,
              animationDelay: `${q.delay}s`,
              animationDuration: `${q.duration}s`,
            }}
          >
            &#10077;
          </span>
        ))}
      </div>

      <div className={styles.center}>
        <div className={styles.logoWrap}>
          <div className={styles.ring} />
          <img src={logo} alt="Ragnarok" className={styles.logo} />
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} />
        </div>

        <p className={styles.label}>
          Cargando
          <span className={styles.dots}>
            <span>.</span><span>.</span><span>.</span>
          </span>
        </p>
      </div>
    </div>
  )
}