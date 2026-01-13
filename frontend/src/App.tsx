import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import ContributorPage from './pages/Contributor/Contributor'

function App() {
  return (
    <BrowserRouter>
      <div id="root">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contributors" element={<ContributorPage />} />
          <Route path="/contributor" element={<ContributorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
