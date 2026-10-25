/**
 * scripts/generate_sitemap.js
 * Generates frontend/public/sitemap.xml from live production API data.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function run() {
  console.log('Fetching live products and categories for sitemap...');
  const [products, categories] = await Promise.all([
    fetchJson('https://api.ssseedshop.com/products/get.php').catch(() => []),
    fetchJson('https://api.ssseedshop.com/categories/get.php').catch(() => []),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const baseUrl = 'https://ssseedshop.com';

  const statics = [
    { loc: `${baseUrl}/`, pri: '1.0', freq: 'daily' },
    { loc: `${baseUrl}/all-products`, pri: '0.9', freq: 'daily' },
    { loc: `${baseUrl}/products`, pri: '0.9', freq: 'daily' },
    { loc: `${baseUrl}/categories`, pri: '0.8', freq: 'weekly' },
    { loc: `${baseUrl}/cultivation-guide`, pri: '0.8', freq: 'weekly' },
    { loc: `${baseUrl}/help`, pri: '0.7', freq: 'monthly' },
    { loc: `${baseUrl}/delivery-charge`, pri: '0.7', freq: 'monthly' },
    { loc: `${baseUrl}/return-policy`, pri: '0.6', freq: 'monthly' },
    { loc: `${baseUrl}/terms-conditions`, pri: '0.5', freq: 'monthly' },
    { loc: `${baseUrl}/privacy-policy`, pri: '0.5', freq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

  // Static Pages
  xml += `  <!-- Main Pages -->\n`;
  for (const s of statics) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(s.loc)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${s.freq}</changefreq>\n`;
    xml += `    <priority>${s.pri}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Categories
  if (Array.isArray(categories) && categories.length > 0) {
    xml += `\n  <!-- Seed Categories -->\n`;
    for (const c of categories) {
      if (!c.name) continue;
      const cUrl = `${baseUrl}/category/${encodeURIComponent(c.name)}`;
      const cTitle = `${c.display_name || c.name} বীজ`;
      const cImg = c.image || c.image_url;

      xml += `  <url>\n`;
      xml += `    <loc>${xmlEscape(cUrl)}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      if (cImg) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${xmlEscape(cImg)}</image:loc>\n`;
        xml += `      <image:title>${xmlEscape(cTitle)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }
  }

  // Products
  if (Array.isArray(products) && products.length > 0) {
    xml += `\n  <!-- Seed Products (Total: ${products.length}) -->\n`;
    for (const p of products) {
      const slug = p.slug || p.id;
      if (!slug) continue;
      const pUrl = `${baseUrl}/product/${encodeURIComponent(slug)}`;
      const pTitle = p.name || 'বীজ';
      const pDate = p.updated_at ? p.updated_at.slice(0, 10) : today;
      const pImg = p.product_image;

      xml += `  <url>\n`;
      xml += `    <loc>${xmlEscape(pUrl)}</loc>\n`;
      xml += `    <lastmod>${xmlEscape(pDate)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (pImg) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${xmlEscape(pImg)}</image:loc>\n`;
        xml += `      <image:title>${xmlEscape(pTitle)}</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }
  }

  xml += `</urlset>\n`;

  const targetFile = path.resolve(__dirname, '../frontend/public/sitemap.xml');
  fs.writeFileSync(targetFile, xml, 'utf8');
  console.log(`Successfully generated sitemap.xml with ${products.length} products and ${categories.length} categories!`);
}

run().catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
