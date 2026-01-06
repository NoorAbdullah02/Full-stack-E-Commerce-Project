const cloudinary = require('./config/cloudinary');
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');

// Create a dummy image buffer (1x1 pixel)
const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

async function testUpload() {
    console.log('Testing Cloudinary Upload...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'test_upload' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });

        console.log('Upload Successful!');
        console.log('URL:', result.secure_url);
    } catch (error) {
        console.error('Upload Failed:', error);
    }
}

testUpload();
