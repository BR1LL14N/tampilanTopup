const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components/layout/header.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Mobile drawer container
content = content.replace(
  'lg:hidden bg-white/95 backdrop-blur-xl animate-fadeIn relative z-40',
  'lg:hidden bg-[#182024] animate-fadeIn relative z-40 shadow-sky-medium'
);

// Desktop sidebar container
content = content.replace(
  'bottom-0 bg-white/90 border-r border-sky-border z-40 p-4 flex flex-col justify-between hidden lg:flex backdrop-blur-md transition-all duration-300 ease-in-out shadow-sky-soft',
  'bottom-0 bg-[#182024] border-r border-sky/20 z-40 p-4 flex flex-col justify-between hidden lg:flex transition-all duration-300 ease-in-out shadow-sky-medium'
);

// User Profile Mobile
content = content.replace(
  'col-span-2 p-3 bg-ice border border-sky-border rounded-xl flex items-center gap-3 mb-2',
  'col-span-2 p-3 bg-black/20 border border-sky/20 rounded-xl flex items-center gap-3 mb-2'
);
content = content.replace(
  '<p className="text-xs font-extrabold text-text-primary uppercase tracking-tight">{currentUser.name}</p>',
  '<p className="text-xs font-extrabold text-white uppercase tracking-tight">{currentUser.name}</p>'
);
content = content.replace(
  'text-[9px] font-bold text-text-muted uppercase tracking-widest leading-none',
  'text-[9px] font-bold text-white/60 uppercase tracking-widest leading-none'
);

// User Profile Desktop Sidebar
content = content.replace(
  'p-3 bg-ice border border-sky-border rounded-xl flex items-center transition-all duration-300',
  'p-3 bg-black/20 border border-sky/20 rounded-xl flex items-center transition-all duration-300'
);
content = content.replace(
  'text-xs font-extrabold text-text-primary uppercase tracking-tight truncate',
  'text-xs font-extrabold text-white uppercase tracking-tight truncate'
);
content = content.replace(
  'text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5',
  'text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5'
);

// Menu Headings
content = content.replaceAll(
  'text-[9px] font-black text-text-muted uppercase tracking-widest px-3 mb-2 animate-fadeIn',
  'text-[9px] font-black text-white/60 uppercase tracking-widest px-3 mb-2 animate-fadeIn'
);
content = content.replaceAll(
  'text-[9px] font-black text-text-muted uppercase tracking-widest px-1',
  'text-[9px] font-black text-white/60 uppercase tracking-widest px-1'
);

// Sidebar Toggle Button
content = content.replace(
  'p-1.5 rounded-lg border border-sky-border hover:border-sky/30 text-text-muted hover:text-sky hover:bg-ice transition-all',
  'p-1.5 rounded-lg border border-sky/20 hover:border-sky/40 text-white/60 hover:text-sky hover:bg-black/20 transition-all'
);
content = content.replace(
  'text-[10px] font-black text-text-muted uppercase tracking-widest animate-fadeIn',
  'text-[10px] font-black text-white/60 uppercase tracking-widest animate-fadeIn'
);

// Nav links (mobile)
content = content.replaceAll(
  'text-xs font-black uppercase tracking-wider text-left text-text-secondary',
  'text-xs font-black uppercase tracking-wider text-left text-white/70 hover:text-white'
);
content = content.replaceAll(
  'text-xs font-black uppercase tracking-wider text-text-secondary',
  'text-xs font-black uppercase tracking-wider text-white/70 hover:text-white'
);

// Nav links (sidebar)
content = content.replaceAll(
  'text-xs font-bold text-text-secondary hover:text-sky hover:bg-ice',
  'text-xs font-bold text-white/70 hover:text-white hover:bg-black/20'
);

// Fix "border-sky-border" to "border-sky/20" on some boundaries
content = content.replace(
  'border-t border-sky-border px-4 pb-6 pt-3 lg:hidden',
  'border-t border-sky/20 px-4 pb-6 pt-3 lg:hidden'
);
content = content.replace(
  'col-span-2 border-t border-sky-border my-2 pt-2',
  'col-span-2 border-t border-sky/20 my-2 pt-2'
);
content = content.replace(
  'space-y-1 border-t border-sky-border pt-4',
  'space-y-1 border-t border-sky/20 pt-4'
);

// Logout button mobile
content = content.replace(
  'col-span-2 rounded-xl border border-red-200 bg-red-50 py-3 text-xs font-black uppercase tracking-widest text-red-500 text-center transition hover:bg-red-100 mt-4',
  'col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-black uppercase tracking-widest text-red-400 text-center transition hover:bg-red-500/20 mt-4'
);

fs.writeFileSync(filePath, content);
console.log('Update complete!');
