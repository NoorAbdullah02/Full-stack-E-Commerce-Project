const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    // Use memory setup if deploying to serverless with no persistent disk, 
    // but for now simple disk storage for temp holding before Cloudinary upload is fine 
    // OR just memoryStorage to avoid disk I/O.
    // Using memoryStorage is better for Cloudinary upload stream.
});

// Filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

module.exports = upload;
