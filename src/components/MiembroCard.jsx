import styles from './MiembroCard.module.css'

function getInitials(nombre) {
  return nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function MiembroCard({ nombre, apodo, descripcion, imagen }) {
  return (
    <article className={styles.card}>
      <div className={styles.avatarWrap}>
        {imagen
          ? <img src={imagen} alt={nombre} className={styles.avatarImg} />
          : <div className={styles.avatarFallback}>{getInitials(nombre)}</div>
        }
      </div>
      <div className={styles.info}>
        <h2 className={styles.nombre}>{nombre}</h2>
        <span className={styles.apodo}>"{apodo}"</span>
        <p className={styles.descripcion}>{descripcion}</p>
      </div>
    </article>
  )
}