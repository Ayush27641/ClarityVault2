const express = require('express');
const router = express.Router();
const {
  upload,
  saveFile,
  deleteFile,
  findFileById,
  downloadFile,
  findAllFilesByUsername
} = require('../controllers/FileUploadController');

// POST /api/files/save - Save file
router.post('/save', upload.single('file'), saveFile);

// DELETE /api/files/delete/:id - Delete file
router.delete('/delete/:id', deleteFile);

// GET /api/files/find/:id - Find file by ID
router.get('/find/:id', findFileById);

// GET /api/files/download/:id - Download file
router.get('/download/:id', downloadFile);

// GET /api/files/findByUsername/:username - Find all files by username
router.get('/findByUsername/:username', findAllFilesByUsername);

module.exports = router;