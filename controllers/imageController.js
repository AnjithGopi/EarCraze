// const multer = require('multer');
// const sharp = require('sharp');
// const crypto = require('crypto');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });
// const upload = multer({dest:'uploads/'})


// const processImage = async (req, res, next) => {
//           try {
//             if (!req.files || req.files.length === 0) {
//               throw new Error('No file uploaded');
//             }
        
//             const uploadedFiles = req.files;
        
//             const processedImages = await Promise.all(
//               uploadedFiles.map(async (file) => {
//                 const randomName = crypto.randomBytes(20).toString('hex');
//                 const outputPath = `uploads/${randomName}.jpeg`;
        
//                 await sharp(file.path)
//                   .resize({ width: 720, height: 720 })
//                   .toFormat('jpeg')
//                   .jpeg({ quality: 90 })
//                   .toFile(outputPath);
        
//                 const processedPath = outputPath
                
                // return processedPath; // Return the processed image path with backslashes
//               })
//             );
        
//             req.processedImages = processedImages;
//             next();
//           } catch (error) {
//             console.error('Error processing image:', error);
//             res.status(500).send('Error processing image');
//           }
//         };

// module.exports = {
//   upload: upload,
//   processImage: processImage,
// };









