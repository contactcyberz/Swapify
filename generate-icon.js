/**
 * Script pour générer l'icône Swapify
 * Lance avec: node generate-icon.js
 *
 * Crée une icône 1024x1024 avec le logo Swapify (fond sombre + symbole ⇄)
 */

const fs = require('fs');
const path = require('path');

// SVG de l'icône Swapify (fond indigo foncé + flèches swap)
const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Fond dégradé sombre -->
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1E293B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10B981;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Fond -->
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>

  <!-- Cercle lumineux central -->
  <circle cx="512" cy="512" r="320" fill="url(#accent)" opacity="0.15"/>
  <circle cx="512" cy="512" r="260" fill="none" stroke="url(#accent)" stroke-width="3" opacity="0.3"/>

  <!-- Flèche gauche → droite (haut) -->
  <g fill="none" stroke="url(#accent)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
    <line x1="290" y1="430" x2="680" y2="430"/>
    <polyline points="620,360 700,430 620,500"/>
  </g>

  <!-- Flèche droite → gauche (bas) -->
  <g fill="none" stroke="url(#accent)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
    <line x1="734" y1="594" x2="344" y2="594"/>
    <polyline points="404,524 324,594 404,664"/>
  </g>

  <!-- Texte SWAPIFY -->
  <text
    x="512" y="780"
    font-family="Arial, Helvetica, sans-serif"
    font-size="90"
    font-weight="900"
    fill="white"
    text-anchor="middle"
    letter-spacing="8"
    opacity="0.95"
  >SWAPIFY</text>
</svg>`;

// Sauvegarder le SVG
const svgPath = path.join(__dirname, 'assets', 'icon.svg');
fs.writeFileSync(svgPath, iconSVG);
console.log('✅ SVG créé :', svgPath);
console.log('');
console.log('📌 Pour créer le PNG final :');
console.log('   1. Va sur https://svgtopng.com/');
console.log('   2. Upload le fichier assets/icon.svg');
console.log('   3. Télécharge en 1024x1024');
console.log('   4. Remplace assets/icon.png par ce fichier');
console.log('   5. Fais pareil pour assets/adaptive-icon.png');
console.log('');
console.log('💡 Ou installe sharp : npm install sharp');
console.log('   Puis relance : node generate-icon.js --png');

// Si sharp est disponible, générer directement le PNG
if (process.argv.includes('--png')) {
  try {
    const sharp = require('sharp');
    const svgBuffer = Buffer.from(iconSVG);

    // icon.png (1024x1024)
    sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(__dirname, 'assets', 'icon.png'))
      .then(() => console.log('✅ icon.png généré !'));

    // adaptive-icon.png (1024x1024)
    sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(__dirname, 'assets', 'adaptive-icon.png'))
      .then(() => console.log('✅ adaptive-icon.png généré !'));

    // splash-icon.png (1284x2778 - iPhone 14 Pro Max)
    const splashSVG = iconSVG.replace('width="1024" height="1024"', 'width="1284" height="2778"')
      .replace('viewBox="0 0 1024 1024"', 'viewBox="-130 -877 1284 2778"');
    sharp(Buffer.from(splashSVG))
      .resize(1284, 2778)
      .png()
      .toFile(path.join(__dirname, 'assets', 'splash-icon.png'))
      .then(() => console.log('✅ splash-icon.png généré !'));

  } catch (e) {
    console.log('⚠️  sharp non installé. Lance: npm install sharp');
  }
}
