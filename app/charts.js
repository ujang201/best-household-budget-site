// Small hand-built SVG charts: a horizontal bar chart and a donut chart. No chart library,
// no network, just strings of SVG the views drop into the page.

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function barChart(rows, options = {}) {
  const width = options.width ?? 520;
  const rowHeight = 30;
  const labelWidth = 132;
  const valueWidth = 92;
  const chartWidth = width - labelWidth - valueWidth - 16;
  const height = rows.length * rowHeight + 8;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const bars = rows
    .map((row, i) => {
      const y = 8 + i * rowHeight;
      const barWidth = Math.max(2, Math.round((row.value / max) * chartWidth));
      return `<text x="0" y="${y + 15}" font-size="12" fill="#1c2420">${escapeXml(row.label)}</text>`
        + `<rect x="${labelWidth}" y="${y + 3}" width="${barWidth}" height="14" rx="4" fill="${row.color}"/>`
        + `<text x="${labelWidth + chartWidth + 8}" y="${y + 15}" font-size="12" fill="#5c6b62" text-anchor="start">${escapeXml(row.valueLabel)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Grafik batang pengeluaran per kategori">${bars}</svg>`;
}

export function donutChart(slices, options = {}) {
  const size = options.size ?? 220;
  const center = size / 2;
  const radius = center - 14;
  const inner = radius * 0.62;
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  let angle = -Math.PI / 2;
  const paths = slices
    .filter((s) => s.value > 0)
    .map((slice) => {
      const start = angle;
      const sweep = (slice.value / total) * Math.PI * 2;
      angle += sweep;
      const end = angle;
      const large = sweep > Math.PI ? 1 : 0;
      const x1 = center + radius * Math.cos(start);
      const y1 = center + radius * Math.sin(start);
      const x2 = center + radius * Math.cos(end);
      const y2 = center + radius * Math.sin(end);
      const ix2 = center + inner * Math.cos(end);
      const iy2 = center + inner * Math.sin(end);
      const ix1 = center + inner * Math.cos(start);
      const iy1 = center + inner * Math.sin(start);
      return `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${ix2.toFixed(2)} ${iy2.toFixed(2)} A ${inner} ${inner} 0 ${large} 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)} Z" fill="${slice.color}"><title>${escapeXml(slice.label)}: ${escapeXml(slice.valueLabel)}</title></path>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Grafik donat pembagian pengeluaran">${paths}`
    + `<text x="${center}" y="${center - 4}" text-anchor="middle" font-size="13" fill="#5c6b62">Total belanja</text>`
    + `<text x="${center}" y="${center + 16}" text-anchor="middle" font-size="15" font-weight="700" fill="#1c2420">${escapeXml(options.centerLabel ?? '')}</text></svg>`;
}
