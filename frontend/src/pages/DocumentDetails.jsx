import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { downloadFile } from '../api/download'

export default function DocumentDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const res = await api.get(`/documents/${id}/versions`)
        setVersions(res.data.versions || [])
      }catch(err){
        console.error('Error fetching versions:', err)
      }finally{
        setLoading(false)
      }
    }
    load()
  },[id])

  const latest = versions[0]

  if(loading) return <p className="text-slate-400">Loading...</p>

  function handleDownload(){
    if(latest._id){
      // prefer originalFilename returned by API so extension is preserved
      downloadFile(latest._id, `${latest.originalFilename || latest.title || 'document'}`)
    }
  }

  async function handleDelete(){
    if(window.confirm('Are you sure you want to delete this document and all its versions? This action cannot be undone.')){
      try{
        await api.delete(`/documents/${id}`)
        alert('Document deleted successfully')
        navigate('/')
      }catch(err){
        alert('Failed to delete document')
        console.error('Delete error:', err)
      }
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Document Details</h2>
      {!latest && <p className="text-slate-500">No versions found.</p>}
      {latest && (
        <div className="bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{latest.title || 'Untitled'}</div>
              <div className="text-sm text-slate-400 mt-1">Category: <span className="text-slate-300 font-semibold">{latest.category}</span></div>
              <div className="text-sm text-slate-400">Latest version: <span className="text-slate-300 font-semibold">v{latest.versionNumber}</span></div>
              <div className="text-sm text-slate-400">Uploaded: {new Date(latest.uploadedAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-semibold transition hover:scale-105 duration-200 shadow hover:shadow-lg">Download Latest</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition duration-200 shadow hover:shadow-lg">Delete Document</button>
            </div>
          </div>

          <div className="border-slate-700 border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Extracted Text Preview</h3>
            <div className="max-h-96 overflow-auto text-sm p-3 bg-slate-900 text-slate-200 rounded-lg border border-slate-700">
              {latest.extractedText ? latest.extractedText.slice(0, 3000) : 'No text content available'}
            </div>
          </div>

          <div className="mt-6 border-slate-700 border-t pt-4">
            <Link to={`/document/${id}/versions`} className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">→ View All Versions</Link>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Link to="/" className="bg-cyan-500 text-slate-900 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 font-medium shadow hover:shadow-lg">Back to Home</Link>
      </div>
    </div>
  )
}
