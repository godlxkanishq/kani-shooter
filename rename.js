const fs = require('fs');
const files = [
  'src/context/GameStateContext.tsx',
  'src/index.css',
  'src/game/scenes/PreloaderScene.ts',
  'src/game/textures.ts',
  'src/components/UI/SettingsTab.tsx',
  'src/components/UI/MissionsTab.tsx',
  'src/components/UI/ShopTab.tsx',
  'src/components/UI/LandingScreen.tsx',
  'src/components/UI/MainMenu.tsx',
  'src/components/Game/GameContainer.tsx',
  'src/game/entities/Player.ts',
  'index.html',
  'tailwind.config.js',
  'package.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Siggy/g, 'Kani')
                     .replace(/siggy/g, 'kani')
                     .replace(/SIGGY/g, 'KANI');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
