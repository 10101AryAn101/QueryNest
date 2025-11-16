const multer = require('multer')

// For now store files in memory to compute hash and run extraction, then user can
// save to GridFS. In production, integrate multer-gridfs-storage or stream to GridFS.
const storage = multer.memoryStorage()
const upload = multer({ storage })

module.exports = upload
