/**
 * Swapify — Générateur de splash screen et icône
 * Lance avec : node generate-splash.js
 * Requiert : npm install sharp (déjà installé)
 */

const sharp = require('sharp');
const path = require('path');

// ── Couleurs de l'app ─────────────────────────────────────────
const BG       = '#040F1E'; // bleu nuit profond
const PRIMARY  = '#0EA5E9'; // bleu ciel
const ACCENT   = '#38BDF8'; // bleu clair
const WHITE    = '#E0F2FE';

// ── SVG helper ────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// ── Splash screen SVG (1242 x 2688 — iPhone 14 Pro Max) ───────
function makeSplashSvg(w, h) {
  const cx = w / 2;
  const cy = h / 2;

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%"   stop-color="#1E293B"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${PRIMARY}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${PRIMARY}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${w}" height="${h}" fill="url(#bg)"/>

  <!-- Glow halos -->
  <ellipse cx="${cx - 80}" cy="${cy - 40}" rx="320" ry="320" fill="url(#glow1)"/>
  <ellipse cx="${cx + 80}" cy="${cy + 40}" rx="260" ry="260" fill="url(#glow2)"/>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy - 60}" r="148" fill="none"
    stroke="${PRIMARY}" stroke-width="2" stroke-opacity="0.25"/>
  <!-- Middle ring -->
  <circle cx="${cx}" cy="${cy - 60}" r="108" fill="none"
    stroke="${PRIMARY}" stroke-width="2" stroke-opacity="0.40"/>

  <!-- Icon background circle -->
  <circle cx="${cx}" cy="${cy - 60}" r="76" fill="#1E293B"/>
  <circle cx="${cx}" cy="${cy - 60}" r="76" fill="${PRIMARY}" fill-opacity="0.15"/>

  <!-- Swap arrows icon (↔) hand-drawn paths -->
  <!-- Left arrow → -->
  <path d="M ${cx - 48} ${cy - 72} L ${cx + 12} ${cy - 72}"
    stroke="${PRIMARY}" stroke-width="6" stroke-linecap="round"/>
  <path d="M ${cx + 0} ${cy - 84} L ${cx + 16} ${cy - 72} L ${cx + 0} ${cy - 60}"
    fill="none" stroke="${PRIMARY}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right arrow ← -->
  <path d="M ${cx + 48} ${cy - 48} L ${cx - 12} ${cy - 48}"
    stroke="${ACCENT}" stroke-width="6" stroke-linecap="round"/>
  <path d="M ${cx + 0} ${cy - 36} L ${cx - 16} ${cy - 48} L ${cx + 0} ${cy - 60}"
    fill="none" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- App name -->
  <text x="${cx}" y="${cy + 56}" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="64" font-weight="800" letter-spacing="-1"
    fill="${WHITE}">Swap</text>
  <text x="${cx + 84}" y="${cy + 56}" text-anchor="start"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="64" font-weight="800" letter-spacing="-1"
    fill="${PRIMARY}">ify</text>

  <!-- Tagline -->
  <text x="${cx}" y="${cy + 108}" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="28" font-weight="400" letter-spacing="0.5"
    fill="#94A3B8">Échange tes compétences</text>

  <!-- Bottom dots -->
  <circle cx="${cx - 16}" cy="${cy + 200}" r="6" fill="${PRIMARY}" opacity="0.9"/>
  <circle cx="${cx}"      cy="${cy + 200}" r="6" fill="${PRIMARY}" opacity="0.5"/>
  <circle cx="${cx + 16}" cy="${cy + 200}" r="6" fill="${PRIMARY}" opacity="0.2"/>
</svg>`;
}

// ── Icon SVG (1024 x 1024) ─────────────────────────────────────
function makeIconSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.42;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="40%" cy="35%" r="75%">
      <stop offset="0%"   stop-color="#1E293B"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${PRIMARY}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${PRIMARY}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Rounded square background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="url(#bgGrad)"/>

  <!-- Glow -->
  <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="url(#glow)"/>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
    stroke="${PRIMARY}" stroke-width="${size * 0.012}" stroke-opacity="0.3"/>
  <!-- Inner ring -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="none"
    stroke="${PRIMARY}" stroke-width="${size * 0.012}" stroke-opacity="0.2"/>

  <!-- Center circle -->
  <circle cx="${cx}" cy="${cy}" r="${r * 0.50}" fill="${PRIMARY}" fill-opacity="0.15"/>

  <!-- Arrow → top -->
  <path d="M ${cx - r * 0.38} ${cy - r * 0.18} L ${cx + r * 0.18} ${cy - r * 0.18}"
    stroke="${PRIMARY}" stroke-width="${size * 0.055}" stroke-linecap="round"/>
  <path d="M ${cx + r * 0.04} ${cy - r * 0.38} L ${cx + r * 0.24} ${cy - r * 0.18} L ${cx + r * 0.04} ${cy + r * 0.02}"
    fill="none" stroke="${PRIMARY}" stroke-width="${size * 0.055}"
    stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Arrow ← bottom -->
  <path d="M ${cx + r * 0.38} ${cy + r * 0.18} L ${cx - r * 0.18} ${cy + r * 0.18}"
    stroke="${ACCENT}" stroke-width="${size * 0.055}" stroke-linecap="round"/>
  <path d="M ${cx - r * 0.04} ${cy + r * 0.38} L ${cx - r * 0.24} ${cy + r * 0.18} L ${cx - r * 0.04} ${cy - r * 0.02}"
    fill="none" stroke="${ACCENT}" stroke-width="${size * 0.055}"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// ── Generate ───────────────────────────────────────────────────
async function generate() {
  console.log('🎨 Génération des assets Swapify...\n');

  // Splash screen (1242 x 2688)
  await sharp(Buffer.from(makeSplashSvg(1242, 2688)))
    .png()
    .toFile(path.join(__dirname, 'assets', 'splash-icon.png'));
  console.log('✅ assets/splash-icon.png');

  // App icon (1024 x 1024)
  await sharp(Buffer.from(makeIconSvg(1024)))
    .png()
    .toFile(path.join(__dirname, 'assets', 'icon.png'));
  console.log('✅ assets/icon.png');

  // Adaptive icon Android foreground (1024 x 1024, transparent bg)
  const adaptiveSvg = makeIconSvg(1024).replace(
    '<rect width="1024" height="1024" rx="224.64" ry="224.64" fill="url(#bgGrad)"/>',
    '<rect width="1024" height="1024" rx="224.64" ry="224.64" fill="transparent"/>'
  );
  await sharp(Buffer.from(adaptiveSvg))
    .png()
    .toFile(path.join(__dirname, 'assets', 'adaptive-icon.png'));
  console.log('✅ assets/adaptive-icon.png');

  // Favicon (48 x 48)
  await sharp(Buffer.from(makeIconSvg(256)))
    .resize(48, 48)
    .png()
    .toFile(path.join(__dirname, 'assets', 'favicon.png'));
  console.log('✅ assets/favicon.png');

  console.log('\n🚀 Tous les assets sont générés !');
  console.log('   Relance : npx expo start --clear\n');
}

generate().catch(console.error);
