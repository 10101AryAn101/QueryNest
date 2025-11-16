import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleNameChange(e){
    setName(e.target.value)
    if (error) setError('')
  }

  function handleEmailChange(e){
    setEmail(e.target.value)
    if (error) setError('')
  }

  async function submit(e){
    e.preventDefault()
    if (!name.trim()) {
      setError('Full name is required')
      return
    }
    if (!email.includes('@')) {
      setError('Email must include @ symbol')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    try{
      await api.post('/auth/signup', { name: name.trim(), email, password })
      alert('Signup successful. Please login.')
      navigate('/auth/login')
    }catch(err){
      setError(err?.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow border border-slate-700 mt-10">
      <h2 className="text-xl text-slate-200 font-bold mb-4">Sign up</h2>
      {error && <div className="bg-red-900 text-red-300 p-2 rounded mb-3">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Full Name" value={name} onChange={handleNameChange} required />
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Email" value={email} onChange={handleEmailChange} required />
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition">Sign up</button>
      </form>
      <div className="mt-3 text-center text-slate-400">Already have an account? <Link to="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">Log in</Link></div>
    </div>
  )
}
