const fs = require('fs')
const os = require('os')
const pdf = require('pdf-parse')
const mammoth = require('mammoth')
const { createWorker } = require('tesseract.js')
const pdf2pic = require('pdf2pic')
// pptx parser is optional — handle gracefully if not installed
let pptx2json = null
try{
  pptx2json = require('pptx2json')
}catch(e){
  pptx2json = null
}

async function extractTextFromBuffer(buffer, mimeType, filename){
  try{
    if(mimeType === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf')){
      const data = await pdf(buffer)
      let text = data.text || ''
      const numPages = data.numpages

      // Check if likely scanned PDF: very little text relative to page count
      if (text.trim().length < Math.max(50, numPages * 10) && numPages > 0 && numPages <= 50){
        console.log('Detected potential scanned PDF, running OCR...')
        const savePath = os.tmpdir()
        const convert = pdf2pic.fromBuffer(buffer, {
          density: 300,
          saveFilename: `img-${Date.now()}`,
          savePath: savePath,
          format: "png",
          quality: 100,
          width: 2000,
          height: 2000
        })

        const ocrTexts = []
        const worker = await createWorker()
        try {
          const pagesToProcess = Math.min(numPages, 20) // Limit to avoid long processing
          for (let i = 1; i <= pagesToProcess; i++) {
            const imagePath = await convert(i)
            const { data: { text: pageText } } = await worker.recognize(imagePath.path || imagePath)
            ocrTexts.push(pageText)
            // Clean up image file
            try { fs.unlinkSync(imagePath.path || imagePath) } catch(e) {}
          }
          text = ocrTexts.join('\n')
          console.log(`OCR completed for ${pagesToProcess} pages`)
        } finally {
          await worker.terminate()
        }
      }
      return text.trim()
    }
    if(filename?.toLowerCase().endsWith('.docx')){
      const result = await mammoth.extractRawText({ buffer })
      return result.value || ''
    }
    if(filename?.toLowerCase().endsWith('.pptx')){
      if(pptx2json){
        // pptx2json expects path; write temp file
        const tmp = `${os.tmpdir()}/${Date.now()}-${filename}`
        fs.writeFileSync(tmp, buffer)
        const j = await pptx2json.convert(tmp)
        try{ fs.unlinkSync(tmp) }catch(e){}
        return JSON.stringify(j)
      }else{
        console.warn('pptx extraction skipped: pptx2json not installed')
        return ''
      }
    }
    // plain text
    return buffer.toString('utf8')
  }catch(err){
    console.error('extractText error', err)
    return ''
  }
}

module.exports = { extractTextFromBuffer }
