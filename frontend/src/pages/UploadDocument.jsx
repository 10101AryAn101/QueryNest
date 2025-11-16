import React, { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ["Brand","Strategy","Social Media","Campaign","Ads","Emails","Research","Analytics","Other"]

export default function UploadDocument(){
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [tags, setTags] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    if(!file) return alert('Please select a file')
    let finalCategory = category
    if(category === "Other"){
      if(!customCategory.trim()) return alert('Please enter a custom category')
      finalCategory = customCategory.trim()
    }
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title || file.name)
    fd.append('category', finalCategory)
    fd.append('tags', tags)
    try{
      const res = await api.post('/documents/upload', fd, { headers: {'Content-Type':'multipart/form-data'} })
      alert(res.data.message || 'Uploaded')
      navigate('/')
    }catch(err){
      alert(err?.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-6 rounded-lg shadow border border-slate-700">
      <h2 className="text-xl text-slate-200 font-bold mb-4">Upload Document</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 text-slate-100 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500">
          {CATEGORIES.map(c=> <option key={c} value={c} className="bg-slate-700 text-slate-100">{c}</option>)}
        </select>
        {category === "Other" && (
          <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="Enter custom category" value={customCategory} onChange={e=>setCustomCategory(e.target.value)} />
        )}
        <input className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500" placeholder="tags (comma separated)" value={tags} onChange={e=>setTags(e.target.value)} />
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="dark-input w-full p-2 border border-slate-600 text-slate-100 rounded" />
        <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-semibold transition">Upload</button>
      </form>
    </div>
  )
}
