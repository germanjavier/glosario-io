const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Icon sizes to generate
const iconSizes = [192, 512];

// Generate icons
async function generateIcons() {
  try {
    const inputFile = path.join(imagesDir, 'glosari-logo.png');
    
    if (!fs.existsSync(inputFile)) {
      console.error('Error: Source icon not found at', inputFile);
      return;
    }

    for (const size of iconSizes) {
      const outputFile = path.join(imagesDir, `icon-${size}x${size}.png`);
      
      await sharp(inputFile)
        .resize(size, size)
        .toFile(outputFile);
      
      console.log(`Generated ${outputFile}`);
    }
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
