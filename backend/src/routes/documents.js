const router = require('express').Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const { uploadDocument, downloadFile, search, deleteDocument } = require('../controllers/docController')

router.post('/upload', auth, upload.single('file'), uploadDocument)
router.get('/download/:versionId', auth, downloadFile)
router.get('/search', auth, search)

// /:documentId/versions MUST come before /:documentId
router.get('/:documentId/versions', auth, async (req, res) => {
  try{
    const Version = require('../models/Version')
    const mongoose = require('mongoose')
    const pipeline = [
      { $match: { documentId: new mongoose.Types.ObjectId(req.params.documentId) } },
      { $sort: { uploadedAt: -1 } },
      { $lookup: { from: 'documents', localField: 'documentId', foreignField: '_id', as: 'doc' } },
      { $unwind: { path: '$doc', preserveNullAndEmptyArrays: true } },
      { $project: {
        _id: 1,
        versionNumber: 1,
        uploadedBy: 1,
        uploadedAt: 1,
        fileType: 1,
        fileSize: 1,
        originalFilename: 1,
        extractedText: 1,
        title: '$doc.title',
        category: '$doc.category'
      } }
    ]
    const versions = await Version.aggregate(pipeline)
    res.json({ versions })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Error fetching versions' })
  }
})

router.get('/:documentId', auth, async (req, res) => {
  try{
    const Document = require('../models/Document')
    const Version = require('../models/Version')
    const mongoose = require('mongoose')
    const doc = await Document.findById(req.params.documentId)
    if(!doc) return res.status(404).json({ message: 'Document not found' })
    const latestVersion = await Version.findOne({ documentId: req.params.documentId }).sort({ versionNumber: -1 })
    res.json({ document: doc, latestVersion })
  }catch(err){
    console.error(err)
    res.status(500).json({ message: 'Error fetching document' })
  }
})

router.delete('/:documentId', auth, deleteDocument)

module.exports = router
