import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'data', 'heartopia-codes.json');
const pagePath = path.join(root, 'ja', 'codes', 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function jaDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${year}年${month}月${day}日`;
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
      : '無料報酬（内容はゲーム内で確認）';
    const expires = item.expires && item.expires !== 'No posted expiry'
      ? item.expires
      : '期限の記載なし';
    return `                    <tr${rowClass}>
                        <td class="px-4 py-3"><div class="flex items-center gap-2"><code class="code-value font-bold text-cozy-bark">${escapeHtml(item.code)}</code>${badge}</div></td>
                        <td class="px-4 py-3 text-cozy-wood">${escapeHtml(reward)}</td>
                        <td class="px-4 py-3 text-cozy-wood">${escapeHtml(expires)}</td>
                        <td class="px-4 py-3"><button type="button" class="copy-button rounded-md border border-cozy-bark bg-white px-3 py-2 font-bold" data-copy-code="${escapeHtml(item.code)}">コピー</button></td>
                    </tr>`;
  }).join('\n');
}

function renderExpiredRows(data) {
  return data.expired.map((item) => `                    <div class="flex items-center justify-between gap-3 rounded-md bg-gray-50 p-3">
                        <code class="code-value font-bold text-gray-700">${escapeHtml(item.code)}</code>
                        <span class="text-xs text-gray-500">期限切れ</span>
                    </div>`).join('\n');
}

function renderPage(html, data) {
  const displayDate = jaDate(data.lastChecked);
  return html
    .replace(/【\d{4}年\d{1,2}月\d{1,2}日更新】/g, `【${displayDate}更新】`)
    .replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g, `"dateModified":"${data.lastChecked}"`)
    .replace(/(<span data-code-last-checked>)[^<]+(<\/span>)/, `$1${displayDate}$2`)
    .replace(/(<span data-code-active-count>)[^<]+(<\/span>)/, `$1${data.active.length}$2`)
    .replace(/(<span data-code-expired-count>)[^<]+(<\/span>)/, `$1${data.expired.length}$2`)
    .replace(
      /<!-- codes-ja-active-start -->[\s\S]*?<!-- codes-ja-active-end -->/,
      `<!-- codes-ja-active-start -->\n${renderActiveRows(data)}\n                    <!-- codes-ja-active-end -->`
    )
    .replace(
      /<!-- codes-ja-expired-start -->[\s\S]*?<!-- codes-ja-expired-end -->/,
      `<!-- codes-ja-expired-start -->\n${renderExpiredRows(data)}\n                    <!-- codes-ja-expired-end -->`
    );
}

function renderSitemap(xml, isoDate) {
  return xml.replace(
    /(<loc>https:\/\/heartopia\.life\/ja\/codes\/<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    `$1${isoDate}$2`
  );
}

const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
const page = await fs.readFile(pagePath, 'utf8');
const sitemap = await fs.readFile(sitemapPath, 'utf8');

await fs.writeFile(pagePath, `${renderPage(page, data).trimEnd()}\n`);
await fs.writeFile(sitemapPath, `${renderSitemap(sitemap, data.lastChecked).trimEnd()}\n`);

console.log(`Rendered Japanese codes page: ${data.active.length} active, ${data.expired.length} expired`);
