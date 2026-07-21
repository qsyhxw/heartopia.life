import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'heartopia-codes.json');
const pagePath = path.join(root, 'zh-tw', 'codes', 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function twDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${year} 年 ${month} 月 ${day} 日`;
}

function renderActiveRows(data) {
  return data.active.map((item) => {
    const isNew = item.status === 'new';
    const rowClass = isNew ? ' class="bg-green-50"' : '';
    const badge = isNew
      ? '<span class="rounded bg-green-600 px-2 py-1 text-[11px] font-bold text-white">NEW</span>'
      : '';
    const reward = item.reward && item.reward !== 'Free rewards'
      ? item.reward
      : '免費獎勵（內容以遊戲內顯示為準）';
    const expires = item.expires && item.expires !== 'No posted expiry'
      ? item.expires
      : '官方未公告期限';
    return `                    <tr${rowClass}>
                        <td class="px-4 py-3"><div class="flex items-center gap-2"><code class="code-value font-bold text-cozy-bark">${escapeHtml(item.code)}</code>${badge}</div></td>
                        <td class="px-4 py-3 text-cozy-wood">${escapeHtml(reward)}</td>
                        <td class="px-4 py-3 text-cozy-wood">${escapeHtml(expires)}</td>
                        <td class="px-4 py-3"><button type="button" class="copy-button rounded-md border border-cozy-bark bg-white px-3 py-2 font-bold" data-copy-code="${escapeHtml(item.code)}">複製代碼</button></td>
                    </tr>`;
  }).join('\n');
}

function renderExpiredRows(data) {
  return data.expired.map((item) => `                    <div class="flex items-center justify-between gap-3 rounded-md bg-gray-50 p-3">
                        <code class="code-value font-bold text-gray-700">${escapeHtml(item.code)}</code>
                        <span class="text-xs text-gray-500">已失效</span>
                    </div>`).join('\n');
}

function renderPage(html, data) {
  const displayDate = twDate(data.lastChecked);
  return html
    .replace(/【\d{4}\s*年\s*\d{1,2}\s*月\s*\d{1,2}\s*日更新】/g, `【${displayDate}更新】`)
    .replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g, `"dateModified":"${data.lastChecked}"`)
    .replace(/(<span data-code-last-checked>)[^<]+(<\/span>)/g, `$1${displayDate}$2`)
    .replace(/(<span data-code-active-count>)[^<]+(<\/span>)/g, `$1${data.active.length}$2`)
    .replace(/(<span data-code-expired-count>)[^<]+(<\/span>)/g, `$1${data.expired.length}$2`)
    .replace(
      /<!-- codes-zh-tw-active-start -->[\s\S]*?<!-- codes-zh-tw-active-end -->/,
      `<!-- codes-zh-tw-active-start -->\n${renderActiveRows(data)}\n                    <!-- codes-zh-tw-active-end -->`
    )
    .replace(
      /<!-- codes-zh-tw-expired-start -->[\s\S]*?<!-- codes-zh-tw-expired-end -->/,
      `<!-- codes-zh-tw-expired-start -->\n${renderExpiredRows(data)}\n                    <!-- codes-zh-tw-expired-end -->`
    );
}

function renderSitemap(xml, isoDate) {
  return xml.replace(
    /(<loc>https:\/\/heartopia\.life\/zh-tw\/codes\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${isoDate}$2`
  );
}

const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
const page = await fs.readFile(pagePath, 'utf8');
const sitemap = await fs.readFile(sitemapPath, 'utf8');

await fs.writeFile(pagePath, `${renderPage(page, data).trimEnd()}\n`);
await fs.writeFile(sitemapPath, `${renderSitemap(sitemap, data.lastChecked).trimEnd()}\n`);

console.log(`Rendered Traditional Chinese codes page: ${data.active.length} active, ${data.expired.length} expired`);


