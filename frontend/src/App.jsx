import React, { useState } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import UploadDocument from './pages/UploadDocument'
import DocumentDetails from './pages/DocumentDetails'
import VersionHistory from './pages/VersionHistory'
import ProtectedRoute from './components/ProtectedRoute'
import SearchResults from './pages/SearchResults'
import { useAuth } from './context/AuthContext'

export default function App(){
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()
  const { token, setToken } = useAuth()

  function handleSearch(e){
    e.preventDefault()
    if(searchQ.trim()){
      navigate(`/search?q=${encodeURIComponent(searchQ)}`)
      setSearchQ('')
    }
  }

  function handleLogout(){
    setToken(null)
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-slate-800/90 backdrop-blur shadow p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 gap-4">
          <div className="flex gap-4 items-center">
      <Link to="/" className="font-bold text-3xl text-emerald-500 hover:text-emerald-400 transition-colors">QueryNest</Link>
          </div>
          {token && (
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                className="dark-input px-3 py-1 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Search..."
                value={searchQ}
                onChange={e=>setSearchQ(e.target.value)}
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1 rounded hover:scale-105 transition-all duration-200 shadow hover:shadow-lg font-medium">Search</button>
            </form>
          )}
          {token && (
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded hover:scale-105 transition-all duration-200 shadow hover:shadow-lg">Sign Out</button>
          )}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadDocument/></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchResults/></ProtectedRoute>} />
          <Route path="/document/:id" element={<ProtectedRoute><DocumentDetails/></ProtectedRoute>} />
          <Route path="/document/:id/versions" element={<ProtectedRoute><VersionHistory/></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
