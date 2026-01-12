const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Read the SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'icon-192.png'));

    console.log('✓ Generated icon-192.png');

    // Generate 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));

    console.log('✓ Generated icon-512.png');

    // Generate 180x180 PNG for Apple (iOS)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-icon.png'));

    console.log('✓ Generated apple-icon.png');
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

