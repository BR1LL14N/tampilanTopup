const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\laragon\\www\\freelance-top-up-app\\public\\assets\\games';

// Mapping uploaded file names to destination game folder slugs
const mapping = {
  'ASSET WEBSITE ICON GAME AOV.png': ['arena-of-valor', 'aov'],
  'ASSET WEBSITE ICON GAME FC MOBILE.png': ['fc-mobile', 'ea-sports-fc'],
  'ASSET WEBSITE ICON GAME FF.png': ['free-fire'],
  'ASSET WEBSITE ICON GAME GENSHIN.png': ['genshin-impact'],
  'ASSET WEBSITE ICON GAME GROWTOPIA.png': ['growtopia'],
  'ASSET WEBSITE ICON GAME HOK.png': ['honor-of-kings'],
  'ASSET WEBSITE ICON GAME HONKAI STAR RAIL.png': ['honkai-star-rail'],
  'ASSET WEBSITE ICON GAME MC GOGO.png': ['magic-chess', 'mc-gogo'],
  'ASSET WEBSITE ICON GAME MLBB.png': ['mobile-legends'],
  'ASSET WEBSITE ICON GAME PUBG.png': ['pubg-mobile'],
  'ASSET WEBSITE ICON GAME VALORANT.png': ['valorant'],
  'ASSET WEBSITE ICON GAME ZENLESS ZONE ZERO.png': ['zenless-zone-zero', 'zzz']
};

console.log('Organizing game asset files...\n');

Object.entries(mapping).forEach(([srcFile, destFolders]) => {
  const srcPath = path.join(baseDir, srcFile);
  if (!fs.existsSync(srcPath)) {
    console.log(`Source file not found: ${srcFile}`);
    return;
  }

  destFolders.forEach(folderName => {
    const targetDir = path.join(baseDir, folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${folderName}`);
    }

    // Copy to poster.png, icon.png, and card.png
    const targets = ['poster.png', 'icon.png', 'card.png'];
    targets.forEach(targetName => {
      const destPath = path.join(targetDir, targetName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcFile} -> ${folderName}/${targetName}`);
    });
  });
});

console.log('\nAsset organization complete!');
