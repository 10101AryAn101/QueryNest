import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setToken } = useAuth()

  function handleEmailChange(e){
    setEmail(e.target.value)
    if (error) setError('')
  }

  async function submit(e){
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Email must include @ symbol')
      return
    }
    setError('')
    try{
      const res = await api.post('/auth/login', { email, password })
      setToken(res.data.token)
      navigate('/dashboard')
    }catch(err){
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow mt-10 border border-slate-700">
      <h2 className="text-xl text-slate-200 font-bold mb-4">Login</h2>
      {error && <div className="bg-red-900 text-red-300 p-2 rounded mb-3">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Email" value={email} onChange={handleEmailChange} required />
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-semibold transition">Login</button>
      </form>
      <div className="mt-3 text-center text-slate-400">No account? <Link to="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">Sign up</Link></div>
    </div>
  )
}
