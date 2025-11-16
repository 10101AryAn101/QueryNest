const Document = require('../models/Document')
const Version = require('../models/Version')
const { sha256Buffer } = require('../utils/hash')
const { extractTextFromBuffer } = require('../utils/extractText')
const mongoose = require('mongoose')

exports.uploadDocument = async (req, res) => {
  try{
    const { title, category, tags } = req.body
    const file = req.file
    if(!file) return res.status(400).json({ message: 'No file uploaded' })
    const hash = sha256Buffer(file.buffer)

    // check duplicate by hash
    const existingHash = await Version.findOne({ hash })
    if(existingHash) return res.status(200).json({ message: 'Duplicate document. Already exists.' })

    // find or create document
    let doc = await Document.findOne({ title })
    let versionNumber;
    if(!doc){
      doc = new Document({ title, category, tags: tags ? tags.split(',').map(t=>t.trim()) : [] })
      versionNumber = 1
      await doc.save()
    }else{
      versionNumber = doc.latestVersion + 1
    }

    // create new version
    const latestVersion = versionNumber
    const extractedText = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname)
    if(!extractedText || extractedText.length === 0) {
      console.warn('Warning: No text extracted from file:', file.originalname)
    }

    // Save file to GridFS
    let gridfsFileId = null
    try{
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' })
      const { Readable } = require('stream')
      const readable = new Readable()
      readable.push(file.buffer)
      readable.push(null)
      const uploadStream = bucket.openUploadStream(file.originalname, { contentType: file.mimetype })
      readable.pipe(uploadStream)
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => { 
          gridfsFileId = uploadStream.id
          console.log('GridFS file saved with ID:', gridfsFileId)
          resolve() 
        })
        uploadStream.on('error', (err) => {
          console.error('GridFS upload error:', err)
          reject(err)
        })
      })
    }catch(e){
      console.error('GridFS save error', e)
      return res.status(500).json({ message: 'File storage error: ' + e.message })
    }

    const version = new Version({
      documentId: doc._id,
      versionNumber: latestVersion,
      hash,
      gridfsFileId,
      fileType: file.mimetype,
      fileSize: file.size,
      originalFilename: file.originalname,
      extractedText,
      uploadedBy: req.user.id
    })
    await version.save()
    console.log('Version saved with extractedText length:', version.extractedText?.length || 0)

    doc.latestVersion = latestVersion
    doc.updatedAt = new Date()
    await doc.save()

    res.json({ message: 'Uploaded', versionId: version._id })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Upload error' })
  }
}

exports.downloadFile = async (req, res) => {
  try{
    const { versionId } = req.params
    console.log('Download requested for versionId:', versionId)
    
    const version = await Version.findById(versionId)
    console.log('Version found:', {
      _id: version?._id,
      gridfsFileId: version?.gridfsFileId,
      originalFilename: version?.originalFilename,
      fileType: version?.fileType,
      fileSize: version?.fileSize
    })
    
    if(!version) return res.status(404).json({ message: 'Version not found' })
    if(!version.gridfsFileId) {
      console.error('No gridfsFileId in version')
      return res.status(404).json({ message: 'File not found in storage' })
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' })
    
    // Verify file exists in GridFS
    try {
      const files = await mongoose.connection.db.collection('uploads.files').findOne({ _id: version.gridfsFileId })
      console.log('GridFS file metadata:', files ? `Found (size: ${files.length})` : 'Not found')
    } catch (e) {
      console.error('Error checking GridFS:', e)
    }
    
    const downloadStream = bucket.openDownloadStream(version.gridfsFileId)
    
    res.setHeader('Content-Type', version.fileType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${version.originalFilename || 'download'}"`)
    res.setHeader('Content-Length', version.fileSize || 0)
    
    downloadStream.on('error', (err) => {
      console.error('GridFS download stream error:', err)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Download error: ' + err.message })
      }
    })
    
    res.on('error', (err) => {
      console.error('Response error:', err)
      downloadStream.destroy()
    })
    
    downloadStream.pipe(res)
  }catch(err){
    console.error('download error', err)
    res.status(500).json({ message: 'Download error: ' + err.message })
  }
}

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params
    const doc = await Document.findById(documentId)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    // Find all versions
    const versions = await Version.find({ documentId })
    const gridfsIds = versions.map(v => v.gridfsFileId).filter(id => id)

    // Delete from GridFS
    if (gridfsIds.length > 0) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' })
      await Promise.all(gridfsIds.map(id => bucket.delete(id).catch(err => console.error('GridFS delete error:', err))))
    }

    // Delete versions
    await Version.deleteMany({ documentId })

    // Delete document
    await Document.findByIdAndDelete(documentId)

    res.json({ message: 'Document deleted successfully' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Delete error' })
  }
}

exports.search = async (req, res) => {
  try{
    const { q, category, tags, fileType, from, to, page = 1, limit = 20 } = req.query

    const tagArray = tags ? tags.split(',').map(t=>t.trim()) : null

    const pipeline = []

    if(fileType) pipeline.push({ $match: { fileType } })
    if(from || to){
      const range = {}
      if(from) range.$gte = new Date(from)
      if(to) range.$lte = new Date(to)
      pipeline.push({ $match: { uploadedAt: range } })
    }

    // sort by documentId and version number to pick latest
    pipeline.push({ $sort: { documentId: 1, versionNumber: -1 } })

    // group to one entry per document (first is latest due to sort)
    pipeline.push({
      $group: {
        _id: '$documentId',
        versionId: { $first: '$_id' },
        versionNumber: { $first: '$versionNumber' },
        fileType: { $first: '$fileType' },
        fileSize: { $first: '$fileSize' },
        extractedText: { $first: '$extractedText' },
        uploadedAt: { $first: '$uploadedAt' }
      }
    })

    // lookup document metadata
    pipeline.push({ $lookup: { from: 'documents', localField: '_id', foreignField: '_id', as: 'doc' } })
    pipeline.push({ $unwind: '$doc' })

    if(category) pipeline.push({ $match: { 'doc.category': category } })
    if(tagArray) pipeline.push({ $match: { 'doc.tags': { $in: tagArray } } })

    pipeline.push({ $project: {
      documentId: '$_id',
      versionId: 1,
      versionNumber: 1,
      fileType: 1,
      fileSize: 1,
      extractedText: 1,
      uploadedAt: 1,
      title: '$doc.title',
      category: '$doc.category',
      tags: '$doc.tags'
    }})

    // Search query (title, tags, category, or extracted text)
    if(q){
      pipeline.push({ $match: {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
          { category: { $regex: q, $options: 'i' } },
          { extractedText: { $regex: q, $options: 'i' } }
        ]
      }})
    }

    // Sort by recent uploads first
    pipeline.push({ $sort: { uploadedAt: -1 } })

    const results = await Version.aggregate(pipeline).allowDiskUse(true).skip((page-1)*limit).limit(parseInt(limit))
    res.json({ results })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Search error' })
  }
}
