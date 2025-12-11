import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './components/Welcome'
import TableView from './components/TableView'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Welcome /></Layout>} />
        <Route path="/tables/:id" element={<Layout><TableView /></Layout>} />
      </Routes>
    </Router>
  )
}

export default App
