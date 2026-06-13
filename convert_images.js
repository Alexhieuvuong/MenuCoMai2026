const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');

fs.readdir(imagesDir, (err, files) => {
    if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
    }

    files.forEach((file, index) => {
        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            const inputFile = path.join(imagesDir, file);
            const outputFile = path.join(imagesDir, path.basename(file, ext) + '.webp');

            sharp(inputFile)
                .webp({ quality: 80 }) // Adjust quality as needed (0-100)
                .toFile(outputFile)
                .then(info => {
                    console.log(`Converted ${file} to WebP. Size: ${info.size} bytes`);
                })
                .catch(err => {
                    console.error(`Error converting ${file}:`, err);
                });
        }
    });
});
