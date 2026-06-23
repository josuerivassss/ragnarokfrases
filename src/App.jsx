import { useState, useMemo } from 'react'
import data from './assets/frases.json'
import Header from './components/Header'
import Filters from './components/Filters'
import FrasesGrid from './components/FrasesGrid'
import ConocenosView from './components/ConocenosView'
import Footer from './components/Footer'

export default function App() {
  const [vista, setVista] = useState('frases')
  const [filters, setFilters] = useState({ tipo: 'todos', semestre: 'todos' })

  const semestres = useMemo(() =>
    [...new Set(data.frases.map(f => f.semestre))].sort((a, b) => a - b),
    []
  )

  const frasesFiltradas = useMemo(() =>
    data.frases.filter(f => {
      if (filters.tipo !== 'todos' && f.tipo !== filters.tipo) return false
      if (filters.semestre !== 'todos' && f.semestre !== filters.semestre) return false
      return true
    }),
    [filters]
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header vista={vista} onVista={setVista} />
      {vista === 'frases' && (
        <>
          <Filters semestres={semestres} filters={filters} onChange={setFilters} total={frasesFiltradas.length} />
          <FrasesGrid frases={frasesFiltradas} maxSemestre={Math.max(...semestres)} />
        </>
      )}
      {vista === 'conocenos' && <ConocenosView />}
      <Footer />
    </div>
  )
}