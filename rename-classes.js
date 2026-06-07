import fs from 'fs';
import path from 'path';

const dir = './src';

// Recursively traverse src folder
function walk(dirPath, cb) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, cb);
    } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
      cb(fullPath);
    }
  });
}

// Rename map
const replacements = [
  // Brackets classes with green hex
  { from: /border-\[\#39ff14\]\/20/g, to: 'border-siggy-20' },
  { from: /border-\[\#39ff14\]\/30/g, to: 'border-siggy-30' },
  { from: /border-\[\#39ff14\]\/50/g, to: 'border-siggy-50' },
  { from: /border-\[\#39ff14\]\/80/g, to: 'border-siggy-80' },
  { from: /bg-\[\#39ff14\]\/5/g, to: 'bg-siggy-5' },
  { from: /bg-\[\#39ff14\]\/10/g, to: 'bg-siggy-10' },
  { from: /bg-\[\#39ff14\]\/15/g, to: 'bg-siggy-15' },
  { from: /bg-\[\#39ff14\]\/20/g, to: 'bg-siggy-20' },
  
  // Slashes classes
  { from: /bg-zinc-950\/20/g, to: 'bg-zinc-950-20' },
  { from: /bg-zinc-950\/40/g, to: 'bg-zinc-950-40' },
  { from: /bg-zinc-950\/60/g, to: 'bg-zinc-950-60' },
  { from: /bg-zinc-900\/20/g, to: 'bg-zinc-900-20' },
  { from: /bg-zinc-900\/50/g, to: 'bg-zinc-900-50' },
  { from: /bg-zinc-900\/60/g, to: 'bg-zinc-900-60' },
  { from: /bg-red-950\/15/g, to: 'bg-red-950-15' },
  { from: /bg-red-950\/60/g, to: 'bg-red-950-60' },
  { from: /bg-yellow-500\/10/g, to: 'bg-yellow-500-10' },
  { from: /bg-yellow-500\/20/g, to: 'bg-yellow-500-20' },
  { from: /bg-green-500\/10/g, to: 'bg-green-500-10' },
  { from: /bg-green-700\/20/g, to: 'bg-green-700-20' },
  { from: /bg-black\/40/g, to: 'bg-black-40' },
  { from: /bg-black\/45/g, to: 'bg-black-45' },
  { from: /bg-black\/60/g, to: 'bg-black-60' },
  { from: /bg-black\/80/g, to: 'bg-black-80' },
  { from: /bg-black\/85/g, to: 'bg-black-85' },
  { from: /bg-black\/90/g, to: 'bg-black-90' },
  
  { from: /border-zinc-950\/40/g, to: 'border-zinc-950-40' },
  { from: /border-red-800\/40/g, to: 'border-red-800-40' },
  { from: /border-red-550\/20/g, to: 'border-red-550-20' },
  { from: /border-red-500\/20/g, to: 'border-red-500-20' },
  { from: /border-red-500\/40/g, to: 'border-red-500-40' },
  { from: /border-yellow-500\/30/g, to: 'border-yellow-500-30' },
  { from: /border-green-500\/20/g, to: 'border-green-500-20' },
  { from: /border-green-800\/40/g, to: 'border-green-800-40' },

  // Dimensions
  { from: /w-\[800px\]/g, to: 'w-game-viewport' },
  { from: /h-\[450px\]/g, to: 'h-game-viewport' },
  { from: /min-h-\[400px\]/g, to: 'min-h-400' },
  { from: /w-\\\[800px\\\]/g, to: 'w-game-viewport' },
  { from: /h-\\\[450px\\\]/g, to: 'h-game-viewport' },
  { from: /min-h-\\\[400px\\\]/g, to: 'min-h-400' },

  // Additional Hex and Bracket Replacements
  { from: /bg-\[\#07090e\]/g, to: 'bg-siggy-dark' },
  { from: /bg-\[\#39ff14\]/g, to: 'bg-siggy-green' },
  { from: /text-\[\#39ff14\]/g, to: 'text-siggy-green' },
  { from: /accent-\[\#39ff14\]/g, to: 'accent-siggy-green' },
  { from: /to-\[\#39ff14\]/g, to: 'to-siggy-green' },
  { from: /to-\[\#39ff14\]\/5/g, to: 'to-siggy-green-5' },
  { from: /bg-\[\#ffd166\]\/5/g, to: 'bg-gold-5' },
  { from: /border-yellow-500\/30/g, to: 'border-gold-30' },
  { from: /from-green-500\/20/g, to: 'from-green-500-20' },
  { from: /border-\[\#39ff14\]\/40/g, to: 'border-siggy-40' },
  { from: /text-\[\#888\]/g, to: 'text-siggy-gray' },
  { from: /text-\[\#444\]/g, to: 'text-siggy-darkgray' },
  { from: /bg-\[\#111\]/g, to: 'bg-siggy-black' },

  // Shadows/Glows
  { from: /shadow-\[0_0_10px_rgba\(57,255,20,0\.3\)\]/g, to: 'shadow-siggy-glow-sm' },
  { from: /shadow-\[0_0_15px_rgba\(57,255,20,0\.35\)\]/g, to: 'shadow-siggy-glow-md' },
  { from: /shadow-\[0_0_25px_rgba\(57,255,20,0\.3\)\]/g, to: 'shadow-siggy-glow-lg' },
  { from: /hover:shadow-\[0_0_35px_rgba\(57,255,20,0\.5\)\]/g, to: 'hover:shadow-siggy-glow-xl' },
  { from: /bg-gradient-to-r from-green-500 to-\[\#39ff14\]/g, to: 'bg-gradient-to-r from-green-500 to-siggy-green' },
  // CSS Escaped class matches with slashes
  { from: /bg-zinc-950\\\/20/g, to: 'bg-zinc-950-20' },
  { from: /bg-zinc-950\\\/40/g, to: 'bg-zinc-950-40' },
  { from: /bg-zinc-950\\\/60/g, to: 'bg-zinc-950-60' },
  { from: /bg-zinc-900\\\/20/g, to: 'bg-zinc-900-20' },
  { from: /bg-zinc-900\\\/50/g, to: 'bg-zinc-900-50' },
  { from: /bg-zinc-900\\\/60/g, to: 'bg-zinc-900-60' },
  { from: /bg-red-950\\\/15/g, to: 'bg-red-950-15' },
  { from: /bg-red-950\\\/60/g, to: 'bg-red-950-60' },
  { from: /bg-yellow-500\\\/10/g, to: 'bg-yellow-500-10' },
  { from: /bg-yellow-500\\\/20/g, to: 'bg-yellow-500-20' },
  { from: /bg-green-500\\\/10/g, to: 'bg-green-500-10' },
  { from: /bg-green-700\\\/20/g, to: 'bg-green-700-20' },
  { from: /bg-black\\\/40/g, to: 'bg-black-40' },
  { from: /bg-black\\\/45/g, to: 'bg-black-45' },
  { from: /bg-black\\\/60/g, to: 'bg-black-60' },
  { from: /bg-black\\\/80/g, to: 'bg-black-80' },
  { from: /bg-black\\\/85/g, to: 'bg-black-85' },
  { from: /bg-black\\\/90/g, to: 'bg-black-90' },
  { from: /border-zinc-950\\\/40/g, to: 'border-zinc-950-40' },
  { from: /border-red-800\\\/40/g, to: 'border-red-800-40' },
  { from: /border-red-550\\\/20/g, to: 'border-red-550-20' },
  { from: /border-red-500\\\/20/g, to: 'border-red-500-20' },
  { from: /border-red-500\\\/40/g, to: 'border-red-500-40' },
  { from: /border-yellow-500\\\/30/g, to: 'border-yellow-500-30' },
  { from: /border-green-500\\\/20/g, to: 'border-green-500-20' },
  { from: /border-green-800\\\/40/g, to: 'border-green-800-40' },

  // Coordinates
  { from: /left-1\/2/g, to: 'left-1-2' },
  { from: /-translate-x-1\/2/g, to: '-translate-x-1-2' },
  { from: /left-1\\\/2/g, to: 'left-1-2' },
  { from: /-translate-x-1\\\/2/g, to: '-translate-x-1-2' }
];

walk(dir, filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
