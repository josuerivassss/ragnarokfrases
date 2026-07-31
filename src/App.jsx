import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { listFrasesPublicas } from './lib/publicApi'
import Header from './components/Header'
import Filters from './components/Filters'
import FrasesGrid from './components/FrasesGrid'
import ConocenosView from './components/ConocenosView'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import LoginPage from './pages/admin/LoginPage'
import FrasesAdminPage from './pages/admin/FrasesAdminPage'
import AutoresAdminPage from './pages/admin/AutoresAdminPage'
import MiembrosAdminPage from './pages/admin/MiembrosAdminPage'
import AdminsAdminPage from './pages/admin/AdminsAdminPage'

function SitioPublico() {
  const [vista, setVista] = useState('frases')
  const [filters, setFilters] = useState({ tipo: 'todos', semestre: 'todos' })
  const [search, setSearch] = useState('')
  const [frases, setFrases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listFrasesPublicas()
      .then(setFrases)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const semestres = useMemo(() =>
    [...new Set(frases.map(f => f.semestre))].sort((a, b) => a - b),
    [frases]
  )

  const frasesFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase()
    return frases.filter(f => {
      if (filters.tipo !== 'todos' && f.tipo !== filters.tipo) return false
      if (filters.semestre !== 'todos' && f.semestre !== filters.semestre) return false
      if (q && !f.frase.toLowerCase().includes(q)) return false
      return true
    })
  }, [frases, filters, search])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header vista={vista} onVista={setVista} />
      {vista === 'frases' && (
        <>
          <Filters
            semestres={semestres}
            filters={filters}
            onChange={setFilters}
            total={frasesFiltradas.length}
            search={search}
            onSearchChange={setSearch}
          />
          {error ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
              No se pudieron cargar las frases: {error}
            </p>
          ) : loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando…
            </p>
          ) : (
            <FrasesGrid
              frases={frasesFiltradas}
              maxSemestre={semestres.length ? Math.max(...semestres) : 1}
            />
          )}
        </>
      )}
      {vista === 'conocenos' && <ConocenosView />}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SitioPublico />} />

        <Route path="/panel/login" element={<LoginPage />} />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="frases" replace />} />
          <Route path="frases" element={<FrasesAdminPage />} />
          <Route path="autores" element={<AutoresAdminPage />} />
          <Route path="miembros" element={<MiembrosAdminPage />} />
          <Route
            path="admins"
            element={
              <ProtectedRoute ownerOnly>
                <AdminsAdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}