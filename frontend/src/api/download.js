import api from './axios'

export async function downloadFile(versionId, filename = 'document') {
  try {
    const response = await api.get(`/documents/download/${versionId}`, {
      responseType: 'blob'
    })

    // Try to get filename from Content-Disposition header if server provided it
    const contentDisp = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])
    let finalName = filename
    if (contentDisp) {
      const match = /filename="?([^";]+)"?/.exec(contentDisp)
      if (match && match[1]) finalName = match[1]
    }

    const blob = new Blob([response.data], { type: response.data.type || response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', finalName)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Download error:', err)
    alert('Download failed')
  }
}
