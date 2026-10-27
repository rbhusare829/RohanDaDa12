import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceDir = 'D:\\Rohan-Deshmukh-New-Website-2\\Edited';
const portraitsDest = 'D:\\Rohan-Deshmukh-New-Website-2\\frontend\\public\\images\\portraits';
const galleryDest = 'D:\\Rohan-Deshmukh-New-Website-2\\frontend\\public\\images\\gallery\\portraits';

if (!fs.existsSync(portraitsDest)) fs.mkdirSync(portraitsDest, { recursive: true });
if (!fs.existsSync(galleryDest)) fs.mkdirSync(galleryDest, { recursive: true });

// Mapping of selected hero/banner/profile portraits to semantic filenames
const namedPortraits = {
  'Copy of _JP_6431.jpg': 'rohan-blue-suit-smile.webp',     // Homepage About / Hero
  'Copy of _JP_6456.jpg': 'rohan-peach-kurta-namaskar.webp',// Intro Profile Greeting (नमस्कार...) & Biography
  'Copy of _JP_6391.jpg': 'rohan-flag-tiranga.webp',        // Political Career banner with Indian Flag (Tiranga)
  'Copy of _JP_6370.jpg': 'rohan-executive-desk.webp',      // Lokmangal Parivar / Executive Leadership banner
  'Copy of _JP_6313.jpg': 'rohan-blue-jacket-book.webp',    // Philosophy & Ideals (Intro Journey)
  'Copy of _JP_6381.jpg': 'rohan-bandhgala-formal.webp',    // Introduction page banner
  'Copy of _JP_6302.jpg': 'rohan-blue-jacket-balcony.webp', // Vision page banner
  'Copy of _JP_6448.jpg': 'rohan-blue-suit-magazine.webp',  // Appeal page banner
  'Copy of _JP_6471.jpg': 'rohan-white-linen-casual.webp',  // Contact page banner / Grassroots connect
  'Copy of _JP_6237.jpg': 'rohan-white-shirt-armchair.webp',// Modern Youth Leader
  'Copy of _JP_6345.jpg': 'rohan-tea-smile.webp',           // Candid Warmth / Grassroots connect
};

async function processImages() {
  const files = fs.readdirSync(sourceDir).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`Found ${files.length} JPG files in Edited folder.`);

  // 1. Convert named key portraits
  for (const [srcFile, targetName] of Object.entries(namedPortraits)) {
    const srcPath = path.join(sourceDir, srcFile);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Warning: source file not found: ${srcFile}`);
      continue;
    }
    const destPath = path.join(portraitsDest, targetName);
    console.log(`Processing portrait: ${srcFile} -> ${targetName}`);
    await sharp(srcPath)
      .rotate() // auto-orient based on EXIF
      .resize({ width: 1400, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(destPath);
    const stat = fs.statSync(destPath);
    console.log(`  -> Saved ${targetName} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  // 2. Convert all 28 photos into gallery/portraits folder
  console.log('\nProcessing all 28 gallery portraits...');
  let index = 1;
  const galleryList = [];
  for (const file of files) {
    const srcPath = path.join(sourceDir, file);
    const padded = String(index).padStart(2, '0');
    const targetName = `rd-portrait-${padded}.webp`;
    const destPath = path.join(galleryDest, targetName);

    await sharp(srcPath)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toFile(destPath);

    const stat = fs.statSync(destPath);
    console.log(`  [${index}/${files.length}] ${file} -> ${targetName} (${(stat.size / 1024).toFixed(1)} KB)`);
    galleryList.push({
      src: `/images/gallery/portraits/${targetName}`,
      original: file,
      sizeKb: Math.round(stat.size / 1024),
    });
    index++;
  }

  fs.writeFileSync(
    path.join(galleryDest, 'manifest.json'),
    JSON.stringify(galleryList, null, 2),
    'utf-8'
  );
  console.log('\nProcessing completed successfully!');
}

processImages().catch(err => {
  console.error('Error processing images:', err);
  process.exit(1);
});
