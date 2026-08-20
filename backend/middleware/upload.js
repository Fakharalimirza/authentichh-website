const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Sanitize a folder name for safe filesystem use.
 * Keeps alphanumeric, spaces, dashes, underscores, and Arabic/Unicode letters.
 */
function sanitizeFolderName(name) {
  return name.replace(/[<>:"/\\|?*#@!$%^&()+=\[\]{};']+/g, '').replace(/\s+/g, ' ').trim() || 'listing';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // folder_name is sent from frontend as a form field (before the files)
    const folderName = sanitizeFolderName(req.body.folder_name || String(req.params.id));
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', 'properties', folderName);
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
});

const csvUpload = multer({ storage: multer.memoryStorage() });

// Document upload: PDF + images, 10MB max, stored in uploads/documents/
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', 'documents');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPEG, PNG and WebP files are allowed'), false);
  }
};

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = { upload, csvUpload, documentUpload };
