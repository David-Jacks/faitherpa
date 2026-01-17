import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ContributorPage from './pages/Contributor/Contributor'

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contributors" element={<ContributorPage />} />
          {/* <Route path="/contributor" element={<ContributorPage />} /> */}
        </Routes>
    </BrowserRouter>
  )
}

export default App
