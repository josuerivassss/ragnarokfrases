import styles from './Header.module.css'

export default function Header({ vista, onVista }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>&#10077;</span>
          <div>
            <h1 className={styles.title}>Ragnarok</h1>
            <p className={styles.subtitle}>y sus frases</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${vista === 'frases' ? styles.navActive : ''}`}
            onClick={() => onVista('frases')}
          >
            Frases
          </button>
          <button
            className={`${styles.navBtn} ${vista === 'conocenos' ? styles.navActive : ''}`}
            onClick={() => onVista('conocenos')}
          >
            Conócenos
          </button>
          <a
            href="https://google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.discordBtn}
          >
            Discord
          </a>
        </nav>
      </div>
    </header>
  )
}