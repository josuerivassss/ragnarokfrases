import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, Users, Contact, ShieldCheck, ArrowLeftCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/panel/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>&#10077;</span>
          <span className={styles.brandTitle}>Panel</span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/panel/frases" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <BookOpen size={16} /> Frases
          </NavLink>
          <NavLink to="/panel/autores" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <Users size={16} /> Autores
          </NavLink>
          <NavLink to="/panel/miembros" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            <Contact size={16} /> Miembros
          </NavLink>
          {session?.role === 'owner' && (
            <NavLink to="/panel/admins" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              <ShieldCheck size={16} /> Admins
            </NavLink>
          )}
        </nav>

        <Link to="/" className={styles.backLink}>
          <ArrowLeftCircle size={16} /> Regresar a página principal
        </Link>

        <div className={styles.userBox}>
          <div>
            <p className={styles.userName}>{session?.username}</p>
            <p className={styles.userRole}>{session?.role}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}