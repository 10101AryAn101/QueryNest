const mongoose = require('mongoose')

const versionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  versionNumber: { type: Number, required: true },
  hash: { type: String, required: true, index: true },
  gridfsFileId: { type: mongoose.Schema.Types.ObjectId },
  fileType: { type: String },
  fileSize: { type: Number },
  originalFilename: { type: String },
  extractedText: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
})

// Full-text index on extractedText for search
versionSchema.index({ extractedText: 'text' })

module.exports = mongoose.model('Version', versionSchema)
