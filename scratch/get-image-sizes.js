const fs = require('fs');
const path = require('path');

// Simple PNG dimension reader
function getPngDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      return 'Not a valid PNG';
    }
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return `${width} x ${height} px`;
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

// Simple JPEG dimension reader
function getJpgDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    let offset = 2;
    while (offset < buffer.length) {
      const marker = buffer.readUInt16BE(offset);
      offset += 2;
      if (marker === 0xFFC0 || marker === 0xFFC2) {
        const height = buffer.readUInt16BE(offset + 3);
        const width = buffer.readUInt16BE(offset + 5);
        return `${width} x ${height} px`;
      } else {
        offset += buffer.readUInt16BE(offset);
      }
    }
    return 'Unknown JPG size';
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

function getImageDimensions(filePath) {
  if (filePath.endsWith('.png')) return getPngDimensions(filePath);
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return getJpgDimensions(filePath);
  return 'Unknown format';
}

const gamesDir = 'C:\\laragon\\www\\freelance-top-up-app\\public\\assets\\games';
const subdirs = fs.readdirSync(gamesDir).filter(f => fs.statSync(path.join(gamesDir, f)).isDirectory());

console.log('=== CURRENT GAME ASSET DIMENSIONS ===\n');

subdirs.forEach(dir => {
  const folderPath = path.join(gamesDir, dir);
  const files = fs.readdirSync(folderPath);
  console.log(`Folder: ${dir}`);
  files.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const fullPath = path.join(folderPath, file);
      console.log(`  - ${file}: ${getImageDimensions(fullPath)}`);
    }
  });
  console.log('');
});

// Also check uploaded root icons
const rootFiles = fs.readdirSync(gamesDir).filter(f => !fs.statSync(path.join(gamesDir, f)).isDirectory());
console.log('=== UPLOADED NEW ROOT ICONS ===\n');
rootFiles.forEach(file => {
  if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    const fullPath = path.join(gamesDir, file);
    console.log(`  - ${file}: ${getImageDimensions(fullPath)}`);
  }
});
