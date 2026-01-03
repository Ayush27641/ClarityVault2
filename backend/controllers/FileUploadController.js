const asyncHandler = require('../middleware/asyncHandler');
const multer = require('multer');
const FileService = require('../services/FileService');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Create instance of FileService
const fileService = new FileService();

// Allowed file types for documents and PDFs
const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// @desc    Save file
// @route   POST /api/files/save
// @access  Public
const saveFile = asyncHandler(async (req, res) => {
  try {
    const { username } = req.body;
    const file = req.file;

    // Validate file
    const validationError = validateFile(file);
    if (validationError !== null) {
      return res.status(400).json({ error: validationError });
    }

    // Save file using service
    const savedFile = await fileService.saveFile(username, file);

    res.json({
      message: 'File saved successfully',
      fileId: savedFile.getId(),
      fileName: savedFile.getFileName(),
      fileType: savedFile.getFileType(),
      username: savedFile.getUsername()
    });

  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ 
      error: `Failed to save file: ${error.message}` 
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/files/delete/:id
// @access  Public
const deleteFile = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const file = await fileService.findFileById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fileService.deleteFile(id);
    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: `Failed to delete file: ${error.message}` 
    });
  }
});

// @desc    Find file by ID
// @route   GET /api/files/find/:id
// @access  Public
const findFileById = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const file = await fileService.findFileById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      id: file.getId(),
      username: file.getUsername(),
      fileName: file.getFileName(),
      fileType: file.getFileType(),
      fileSize: file.getData().length
    });

  } catch (error) {
    console.error('Error finding file:', error);
    res.status(500).json({ 
      error: `Failed to find file: ${error.message}` 
    });
  }
});

// @desc    Download file
// @route   GET /api/files/download/:id
// @access  Public
const downloadFile = asyncHandler(async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const file = await fileService.findFileById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set({
      'Content-Type': file.getFileType(),
      'Content-Disposition': `attachment; filename="${file.getFileName()}"`
    });
    
    res.send(file.getData());

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      error: `Failed to download file: ${error.message}` 
    });
  }
});

// @desc    Find all files by username
// @route   GET /api/files/findByUsername/:username
// @access  Public
const findAllFilesByUsername = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    
    const files = await fileService.findAllFilesByUsername(username);

    const fileList = files.map(file => ({
      id: file.getId(),
      fileName: file.getFileName(),
      fileType: file.getFileType(),
      fileSize: file.getData().length
    }));

    res.json({
      files: fileList,
      totalFiles: files.length,
      username: username
    });

  } catch (error) {
    console.error('Error finding files:', error);
    res.status(500).json({ 
      error: `Failed to find files: ${error.message}` 
    });
  }
});

// Validation helper function
function validateFile(file) {
  if (!file) {
    return 'File is empty';
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  const contentType = file.mimetype;
  if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return 'File type not supported. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT';
  }

  const originalFilename = file.originalname;
  if (!originalFilename || originalFilename.trim() === '') {
    return 'Invalid filename';
  }

  return null; // No validation errors
}

module.exports = {
  upload,
  saveFile,
  deleteFile,
  findFileById,
  downloadFile,
  findAllFilesByUsername
};