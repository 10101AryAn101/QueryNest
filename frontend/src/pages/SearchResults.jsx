import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function SearchResults(){
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    async function load(){
      if(!q) return
      setLoading(true)
      try{
        const res = await api.get('/documents/search', { params: { q } })
        setResults(res.data.results || [])
      }catch(err){
        console.error(err)
      }finally{
        setLoading(false)
      }
    }
    load()
  },[q])

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Search Results for "{q}"</h2>
      {loading && <p className="text-slate-400">Searching...</p>}
      {!loading && results.length === 0 && <p className="text-slate-500">No results found. Try a different search term.</p>}
      <div className="space-y-4">
        {results.map(r=> (
          <Link key={r.versionId} to={`/document/${r.documentId}`} className="block bg-slate-800 p-4 rounded-lg shadow-lg hover:shadow-xl border border-slate-700 hover:border-cyan-400/50 transition-all duration-200">
            <div className="font-semibold text-cyan-400 text-lg hover:text-cyan-300 transition-colors">{r.title}</div>
            <div className="text-sm text-slate-400 mt-1">{r.category} • v{r.versionNumber} • {new Date(r.uploadedAt).toLocaleString()}</div>
            {r.tags?.length > 0 && <div className="text-xs text-slate-500 mt-2">Tags: {r.tags.join(', ')}</div>}
            <div className="text-sm text-slate-300 mt-2">"{r.extractedText?.slice(0, 150)}..."</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
