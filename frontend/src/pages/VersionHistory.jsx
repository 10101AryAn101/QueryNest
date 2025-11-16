import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { downloadFile } from '../api/download'

export default function VersionHistory(){
  const { id } = useParams()
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

  if(loading) return <p className="text-slate-400">Loading...</p>

  function handleDownload(versionId, title){
    // prefer originalFilename when present in version metadata
    const ver = versions.find(v => v._id === versionId)
    const name = ver ? (ver.originalFilename || ver.title || title || 'document') : (title || 'document')
    downloadFile(versionId, `${name}`)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-200 mb-4">Version History</h2>
      {versions.length === 0 && <p className="text-slate-500">No versions found.</p>}
      <div className="space-y-3">
        {versions.map(v=> (
          <div key={v._id} className="bg-slate-800 p-4 rounded-lg shadow flex justify-between items-center border border-slate-700">
            <div>
              <div className="font-semibold text-cyan-400 text-lg">v{v.versionNumber}</div>
              <div className="text-sm text-slate-400">Uploaded: {new Date(v.uploadedAt).toLocaleString()}</div>
              <div className="text-sm text-slate-500">File type: {v.fileType} ({(v.fileSize / 1024).toFixed(2)} KB)</div>
            </div>
            <button onClick={()=>handleDownload(v._id, v.title)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 shadow hover:shadow-lg font-semibold">Download</button>
          </div>
        ))}
      </div>
    </div>
  )
}
