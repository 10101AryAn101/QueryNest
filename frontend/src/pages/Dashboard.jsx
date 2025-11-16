import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STATIC_CATEGORIES = ["Brand","Strategy","Social Media","Campaign","Ads","Emails","Research","Analytics"]

export default function Dashboard(){
  const [documents, setDocuments] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [allCategories, setAllCategories] = useState(STATIC_CATEGORIES)

  useEffect(()=>{
    loadDocuments()
  },[])

  async function loadDocuments(){
    setLoading(true)
    try{
      const res = await api.get('/documents/search', { params: { category: selectedCategory || undefined, limit: 100 } })
      const data = res.data.results || []
      setDocuments(data)
      // Update categories to include custom ones
      const uniqueCats = [...new Set(data.map(d => d.category).filter(c => c))].sort()
      setAllCategories([...new Set([...STATIC_CATEGORIES, ...uniqueCats])])
    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  function handleCategoryFilter(cat){
    setSelectedCategory(cat)
  }

  useEffect(()=>{
    loadDocuments()
  },[selectedCategory])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/upload" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-semibold transition hover:scale-105 duration-200 shadow hover:shadow-lg">+ Upload</Link>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>handleCategoryFilter('')} className={`px-3 py-1 rounded transition-colors ${selectedCategory === '' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>All</button>
          {allCategories.map(cat=> (
            <button key={cat} onClick={()=>handleCategoryFilter(cat)} className={`px-3 py-1 rounded transition-colors ${selectedCategory === cat ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Recent Uploads</h3>
        {loading && <p className="text-slate-400">Loading...</p>}
        {!loading && documents.length === 0 && <p className="text-slate-500">No documents yet. <Link to="/upload" className="text-cyan-400 hover:text-cyan-300 transition-colors">Upload one</Link></p>}
        <div className="space-y-2">
          {documents.map(doc=> (
            <Link key={doc.versionId} to={`/document/${doc.documentId}`} className="block bg-slate-800 p-4 rounded-lg shadow-lg hover:shadow-xl border border-slate-700 hover:border-cyan-400/50 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">{doc.title}</h4>
                  <div className="text-sm text-slate-400">{doc.category}</div>
                  <div className="text-xs text-slate-500 mt-1">{doc.tags?.join(', ')}</div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <div>v{doc.versionNumber}</div>
                  <div>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
