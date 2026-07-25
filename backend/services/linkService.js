import { probeUrlStatus } from "./utils.js";

export async function analyzeLinks($, baseUrl, MAX_PROBES = 50) {
  const anchors = $("a[href]");
  const internal = [];
  const external = [];
  const mail = [];
  const tel = [];
  const anchorLinks = [];
  const downloadLinks = [];

  anchors.each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (!href) return;
    if (href.startsWith('mailto:')) {
      mail.push({ href, text });
      return;
    }
    if (href.startsWith('tel:')) {
      tel.push({ href, text });
      return;
    }
    if (href.startsWith('#')) {
      anchorLinks.push({ href, text });
      return;
    }
    try {
      const resolved = new URL(href, baseUrl);
      const obj = { href: resolved.href, text };
      const downloadExt = ['.pdf','.zip','.rar','.exe','.doc','.docx','.xls','.xlsx'];
      if (downloadExt.some(ext => resolved.pathname.toLowerCase().endsWith(ext))) {
        downloadLinks.push(obj);
      }
      if (resolved.hostname === new URL(baseUrl).hostname) internal.push(obj);
      else external.push(obj);
    } catch (e) {
      // ignore
    }
  });

  const uniqueLinks = [...new Set([...internal.map(l=>l.href), ...external.map(l=>l.href)])].slice(0, MAX_PROBES);
  const checks = await Promise.allSettled(uniqueLinks.map(u => probeUrlStatus(u)));
  const broken = [];
  checks.forEach((r, idx) => {
    const u = uniqueLinks[idx];
    if (r.status === 'fulfilled') {
      const st = r.value;
      if (!st || st >= 400) broken.push({ url: u, status: st });
    } else {
      broken.push({ url: u, status: null });
    }
  });

  return { internal, external, anchorLinks, mail, tel, downloadLinks, broken };
}
