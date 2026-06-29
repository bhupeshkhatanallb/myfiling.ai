#!/usr/bin/env node
/**
 * Build script for myfiling.ai dashboard
 *
 * Concatenates JSX files in correct dependency order, then compiles with Babel
 * This ensures that components defining global functions are loaded before they're used
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building dashboard...\n');

// Files to concatenate in dependency order
// Libraries first (define global functions), then app (uses them)
const filesToConcat = [
  'src/components/tweaks/TweaksPanel.jsx',
  'src/components/icons/Icons.jsx',
  'src/components/gauge/Gauge.jsx',
  'src/components/chrome/chrome.jsx',
  'src/components/overlays/Overlays.jsx',
  'src/components/screens/AuthScreen.jsx',
  'src/components/screens/UploadScreen.jsx',
  'src/components/screens/ResultsScreen.jsx',
  'src/components/screens/AllScreens.jsx',
  'src/data/courts.js',
  'src/data/case-types.js',
  'src/data/defects.js',
  'src/data/sample-files.js',
  'src/utils/score-calculator.js',
  'src/utils/report-generator.js',
  'src/utils/defect-filter.js',
  'src/utils/file-handler.js',
  'src/app.jsx'
];

// Step 1: Concatenate files
console.log('📦 Concatenating files in dependency order...');
let concatenated = '// AUTO-GENERATED: Do not edit - run "npm run build" to regenerate\n\n';

filesToConcat.forEach(file => {
  const fullPath = path.join(__dirname, file);
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Remove all export statements (both full lines and inline)
    content = content.replace(/export\s+(default\s+)?/gm, '');
    content = content.replace(/;$\n\s*default\s+/gm, ';\n');
    concatenated += '\n' + content;
    console.log(`  ✓ ${file}`);
  } catch (e) {
    console.error(`  ✗ Failed to read ${file}: ${e.message}`);
    process.exit(1);
  }
});

// Add initialization code at the end
concatenated += `

// Initialize window.FC_DATA with all exported data
window.FC_DATA = {
  SAMPLE_FILES,
  RECENT,
  COURT_RULES,
  COURTS,
  CASE_TYPES,
  ALL_DEFECTS,
  CRITICAL_DEFECTS,
  MEDIUM_DEFECTS,
  EXCELLENT_DEFECTS,
};
`;

// Write concatenated file
const tempFile = path.join(__dirname, '_build-temp.jsx');
fs.writeFileSync(tempFile, concatenated);
console.log(`\n✅ Concatenated ${filesToConcat.length} files`);

// Step 2: Compile with Babel
console.log('\n🔄 Compiling with Babel...');
try {
  execSync(`npx babel "${tempFile}" --out-file app.js --presets @babel/preset-react,@babel/preset-env`, {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ Babel compilation complete\n');
} catch (e) {
  console.error('❌ Babel compilation failed');
  process.exit(1);
}

// Step 3: Cleanup temp file
fs.unlinkSync(tempFile);

// Step 3b: Sync stylesheet (src/styles/app.css -> styles.css)
console.log('\n🎨 Syncing styles.css from src/styles/app.css...');
try {
  fs.copyFileSync(
    path.join(__dirname, 'src/styles/app.css'),
    path.join(__dirname, 'styles.css')
  );
  console.log('✅ styles.css updated');
} catch (e) {
  console.error(`❌ Failed to sync styles.css: ${e.message}`);
  process.exit(1);
}

// Step 4: Verify
console.log('🔍 Verifying build...');
try {
  const appJs = path.join(__dirname, 'app.js');
  const stats = fs.statSync(appJs);

  execSync(`node -c "${appJs}"`, {
    cwd: __dirname,
    stdio: 'ignore'
  });

  console.log(`✅ No syntax errors`);
  console.log(`✅ Output: app.js (${(stats.size / 1024).toFixed(1)} KB)`);
} catch (e) {
  console.error('❌ Verification failed');
  process.exit(1);
}

console.log('\n🎉 Build complete! Ready for deployment.');
console.log('   Run: python -m http.server 8000');
