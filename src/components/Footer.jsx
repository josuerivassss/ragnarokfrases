import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Autoría del proyecto · Ragnarok 2026
        <span className={styles.divider}>|</span>
        Elaborado con
        <span className={styles.react} title="React">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logo}>
            <circle cx="12" cy="12" r="2.5" fill="#22D3EE"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#22D3EE" strokeWidth="1.25" fill="none"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#22D3EE" strokeWidth="1.25" fill="none" transform="rotate(60 12 12)"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#22D3EE" strokeWidth="1.25" fill="none" transform="rotate(120 12 12)"/>
          </svg>
          React
        </span>
      </p>
    </footer>
  )
}