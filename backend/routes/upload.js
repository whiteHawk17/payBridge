const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// POST /upload/file - Upload a single file
router.post('/file', jwtAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine message type based on file mimetype
    let messageType = 'FILE';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'IMAGE';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'VIDEO';
    } else if (req.file.mimetype.startsWith('audio/')) {
      messageType = 'AUDIO';
    } else if (req.file.mimetype.includes('pdf') || req.file.mimetype.includes('document')) {
      messageType = 'DOCUMENT';
    }

    // Create file URL
    const fileUrl = `/uploads/${path.relative(path.join(__dirname, '../uploads'), req.file.path)}`;

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: fileUrl,
      messageType: messageType
    };

    res.json({
      success: true,
      file: fileData
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST /upload/multiple - Upload multiple files
router.post('/multiple', jwtAuth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => {
      let messageType = 'FILE';
      if (file.mimetype.startsWith('image/')) {
        messageType = 'IMAGE';
      } else if (file.mimetype.startsWith('video/')) {
        messageType = 'VIDEO';
      } else if (file.mimetype.startsWith('audio/')) {
        messageType = 'AUDIO';
      } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
        messageType = 'DOCUMENT';
      }

      const fileUrl = `/uploads/${path.relative(path.join(__dirname, '../uploads'), file.path)}`;

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: fileUrl,
        messageType: messageType
      };
    });

    res.json({
      success: true,
      files: files
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// GET /upload/files/:filename - Serve uploaded files
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// DELETE /upload/file/:filename - Delete uploaded file
router.delete('/file/:filename', jwtAuth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router; 