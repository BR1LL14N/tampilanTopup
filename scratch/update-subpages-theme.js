const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
  'about/page.tsx',
  'how-it-works/page.tsx',
  'pricing/page.tsx',
  'help/page.tsx',
  'contact/page.tsx',
  'faq/page.tsx',
  'terms/page.tsx',
  'privacy/page.tsx',
  'refund/page.tsx',
  'check/page.tsx',
  'leaderboard/page.tsx',
  'calculator/page.tsx'
];

const appDir = 'C:\\laragon\\www\\freelance-top-up-app\\app';

pagesToUpdate.forEach(relPath => {
  const fullPath = path.join(appDir, relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace root container bg-slate-50
  content = content.replace(/bg-slate-50\s+text-slate-900/g, 'dark-stripes-teal text-white');
  content = content.replace(/bg-slate-50/g, 'dark-stripes-teal');

  // Replace card bg-white
  content = content.replace(/bg-white\b/g, 'bg-[#183644]/90 backdrop-blur-md');
  
  // Replace text colors
  content = content.replace(/text-text-primary/g, 'text-white');
  content = content.replace(/text-text-secondary/g, 'text-white/80');
  content = content.replace(/text-text-muted/g, 'text-white/60');
  content = content.replace(/border-sky-border/g, 'border-sky/30');
  content = content.replace(/bg-sky\/10\b/g, 'bg-sky/20 border border-sky/30');
  content = content.replace(/bg-slate-50\/50/g, 'bg-black/20');
  content = content.replace(/text-slate-600/g, 'text-white/70');
  content = content.replace(/text-slate-700/g, 'text-white/80');
  content = content.replace(/text-slate-800/g, 'text-white/90');
  content = content.replace(/text-slate-900/g, 'text-white');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated theme for ${relPath}`);
});

console.log('Sub-pages theme update complete!');
