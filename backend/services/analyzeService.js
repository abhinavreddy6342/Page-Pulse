import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";
import { DEFAULT_TIMEOUT, probeContentLength, safeTrim, probeUrlStatus } from "./utils.js";
import { analyzeSEO } from "./seoService.js";
import { analyzeLinks } from "./linkService.js";
import { analyzeAccessibility } from "./accessibilityService.js";
import { analyzeSecurity } from "./securityService.js";
import { analyzePerformance } from "./perfService.js";

export async function analyze(urlInput) {
  if (!urlInput) throw new Error("URL is required");

  let url = urlInput;
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  const start = Date.now();
  const response = await axios.get(url, {
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
    },
    maxRedirects: 5,
    validateStatus: () => true,
  });
  const responseTime = Date.now() - start;

  const statusCode = response.status;
  const html = response.data || "";
  const pageSize = Buffer.byteLength(html, "utf8");

  const $ = cheerio.load(html);

  // Basic fields
  const title = safeTrim($("title").first().text()) || null;
  const metaDescription = safeTrim($('meta[name="description"]').attr("content")) || null;

  const h1Count = $("h1").length;
  const h2Count = $("h2").length;

  const linksElems = $("a[href]");
  const links = linksElems.length;
  const imagesElems = $("img");
  const images = imagesElems.length;

  let imagesWithoutAlt = 0;
  imagesElems.each((i, el) => {
    const alt = safeTrim($(el).attr("alt"));
    if (!alt) imagesWithoutAlt++;
  });

  const rawText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = rawText ? rawText.split(" ").filter(Boolean).length : 0;

  // Use modular services
  const baseUrl = response.config?.url || url;
  const seo = analyzeSEO($, html, baseUrl);
  const linksAnalysis = await analyzeLinks($, baseUrl, 200);
  const accessibility = analyzeAccessibility($);
  const security = analyzeSecurity(response.headers || {}, baseUrl);
  const perf = analyzePerformance(response, responseTime, pageSize);

  // robots.txt and sitemap availability
  let robotsTxtAvailable = false;
  let sitemapAvailable = false;
  try {
    const base = new URL(baseUrl);
    const robotsUrl = `${base.origin}/robots.txt`;
    const sitemapUrl = `${base.origin}/sitemap.xml`;
    const [rResp, sResp] = await Promise.allSettled([
      axios.get(robotsUrl, { timeout: 4000, validateStatus: () => true }),
      axios.get(sitemapUrl, { timeout: 4000, validateStatus: () => true }),
    ]);
    robotsTxtAvailable = rResp.status === 'fulfilled' && rResp.value && rResp.value.status >= 200 && rResp.value.status < 400;
    sitemapAvailable = sResp.status === 'fulfilled' && sResp.value && sResp.value.status >= 200 && sResp.value.status < 400;
  } catch (e) {
    // ignore
  }

  // Probe images for size and broken status (cap)
  const imageSrcs = [];
  imagesElems.each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) {
      try {
        const resolved = new URL(src, baseUrl);
        imageSrcs.push(resolved.href);
      } catch (e) {
        // ignore
      }
    }
  });
  const uniqueImages = [...new Set(imageSrcs)].slice(0, 100);
  const imageChecks = await Promise.allSettled(uniqueImages.map(u => probeUrlStatus(u)));
  const brokenImages = [];
  for (let i = 0; i < imageChecks.length; i++) {
    const r = imageChecks[i];
    const u = uniqueImages[i];
    if (r.status === 'fulfilled') {
      const st = r.value;
      if (!st || st >= 400) brokenImages.push({ url: u, status: st });
    } else {
      brokenImages.push({ url: u, status: null });
    }
  }

  // Find largest images by probing content-length
  const sizes = await Promise.allSettled(uniqueImages.map(u => probeContentLength(u)));
  const imagesWithSizes = [];
  sizes.forEach((r, idx) => {
    if (r.status === 'fulfilled' && r.value) imagesWithSizes.push({ url: uniqueImages[idx], size: r.value });
  });
  imagesWithSizes.sort((a,b)=>b.size - a.size);
  const largestImages = imagesWithSizes.slice(0, 10);

  // ARIA / roles checks: simple heuristics
  const interactiveSelectors = ['button','a[role]','[role="button"]','[tabindex]','[aria-label]','[aria-labelledby]','[aria-hidden]'];
  const ariaIssues = [];
  try {
    // Check interactive elements without accessible name
    const interactiveEls = $('[role], button, a, [tabindex], [aria-label], [aria-labelledby]');
    interactiveEls.each((i, el) => {
      const tag = el.tagName ? el.tagName.toLowerCase() : null;
      const ariaLabel = $(el).attr('aria-label');
      const ariaLabelled = $(el).attr('aria-labelledby');
      const alt = $(el).attr('alt');
      const text = $(el).text() || '';
      if ((tag === 'button' || $(el).attr('role') === 'button' || $(el).attr('onclick')) && !ariaLabel && !ariaLabelled && !alt && text.trim().length === 0) {
        ariaIssues.push({ index: i, tag, problem: 'Interactive element missing accessible name', selector: $(el).attr('id') ? `#${$(el).attr('id')}` : (tag || 'element') });
      }
    });
  } catch (e) {
    // ignore
  }

  // Combine recommendations and normalize shape to include Impact and Example HTML
  const recommendations = [
    ...(seo.seoRecommendations || []).map(r => ({
      priority: r.priority || 'Medium',
      issue: r.problem || r.title || r.description || 'SEO suggestion',
      explanation: r.recommendation || r.explanation || r.recommend || null,
      impact: r.impact || (r.priority && r.priority.toLowerCase().startsWith('h') ? 'High' : 'Medium'),
      fix: r.fix || r.howToFix || null,
      example: r.example || r.fix || null,
      docs: r.docs || null,
    })),
  ];

  if (perf.performanceScore < 70) recommendations.push({ priority: 'High', issue: 'Performance issues', explanation: 'Slow response time or large page size', impact: 'High', fix: null, example: null });
  if (security.securityScore < 60) recommendations.push({ priority: 'High', issue: 'Missing security headers', explanation: 'Add HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy', impact: 'High', fix: null, example: null });
  if ((accessibility.altCoverage ?? 100) < 90 || accessibility.imagesWithoutAlt > 0) recommendations.push({ priority: 'Medium', issue: 'Missing image alt attributes', explanation: 'Provide meaningful alt text for images', impact: 'Medium', fix: '<img src="..." alt="Describe image">', example: '<img src="/logo.png" alt="Company logo">', docs: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/Alt_text' });

  // Add robots/sitemap recommendations
  if (!robotsTxtAvailable) recommendations.push({ priority: 'Low', issue: 'robots.txt missing', explanation: 'Add robots.txt at site root', impact: 'Low', fix: '/robots.txt', example: 'User-agent: *\nDisallow:', docs: 'https://developers.google.com/search/docs/advanced/robots/intro' });
  if (!sitemapAvailable) recommendations.push({ priority: 'Low', issue: 'sitemap.xml missing', explanation: 'Add sitemap.xml at site root', impact: 'Low', fix: '/sitemap.xml', example: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset>', docs: 'https://developers.google.com/search/docs/advanced/sitemaps/overview' });

  // attach ariaIssues recommendation if any
  if (ariaIssues.length > 0) recommendations.push({ priority: 'Medium', issue: 'ARIA / accessible name missing', explanation: 'Interactive elements may lack accessible names (aria-label, aria-labelledby or visible text)', impact: 'Medium', fix: 'Add aria-label or visible text for interactive elements', example: '<button aria-label="Close">✖</button>', docs: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques' });

  // include aria issues into accessibility object
  try { accessibility.ariaIssues = ariaIssues; } catch (e) { /* ignore */ }

  // Provide summary counts and ensure all fields have safe defaults
  const result = {
    statusCode: statusCode ?? 0,
    responseTime: responseTime ?? 0,
    pageSize: pageSize ?? 0,
    title: title ?? "",
    metaDescription: metaDescription ?? "",
    h1: h1Count ?? 0,
    h2: h2Count ?? 0,
    headings: (h1Count ?? 0) + (h2Count ?? 0),
    links: links ?? 0,
    images: images ?? 0,
    imagesWithoutAlt: imagesWithoutAlt ?? 0,
    wordCount: wordCount ?? 0,

    // SEO
    seoScore: (seo && typeof seo.seoScore === 'number') ? seo.seoScore : 0,
    seoChecks: Array.isArray(seo?.seoChecks) ? seo.seoChecks : [],
    seoRecommendations: Array.isArray(seo?.seoRecommendations) ? seo.seoRecommendations : [],
    og: seo?.og || {},
    twitter: seo?.twitter || {},
    structuredData: Array.isArray(seo?.structuredData) ? seo.structuredData : [],
    htmlLang: seo?.htmlLang || "",
    robotsTxtAvailable: !!robotsTxtAvailable,
    sitemapAvailable: !!sitemapAvailable,

    // Performance
    performanceScore: (perf && typeof perf.performanceScore === 'number') ? perf.performanceScore : 0,
    performanceRating: perf?.performanceRating || "",
    contentType: perf?.contentType || "",
    compression: perf?.compression || "",
    encoding: perf?.encoding || "",
    redirectCount: perf?.redirectCount ?? 0,
    finalUrl: perf?.finalUrl || baseUrl,
    estimatedDownloadTime: perf?.estimatedDownloadTimeSec ?? 0,

    // Security
    securityScore: (security && typeof security.securityScore === 'number') ? security.securityScore : 0,
    securityHeaders: security?.securityHeaders || {},
    securityDetails: Array.isArray(security?.details) ? security.details : [],

    // Accessibility
    accessibility: accessibility || {},
    accessibilityScore: (typeof accessibility?.altCoverage === 'number') ? Math.round(accessibility.altCoverage) : (accessibility ? (accessibility.imagesWithAlt && accessibility.totalImages ? Math.round((accessibility.imagesWithAlt / accessibility.totalImages) * 100) : 0) : 0),
    accessibilityChecks: Array.isArray(accessibility?.checks) ? accessibility.checks : [],

    // Links
    internalLinks: Array.isArray(linksAnalysis?.internal) ? linksAnalysis.internal.length : 0,
    externalLinks: Array.isArray(linksAnalysis?.external) ? linksAnalysis.external.length : 0,
    anchorLinks: Array.isArray(linksAnalysis?.anchorLinks) ? linksAnalysis.anchorLinks.length : 0,
    mailLinks: Array.isArray(linksAnalysis?.mail) ? linksAnalysis.mail.length : 0,
    telLinks: Array.isArray(linksAnalysis?.tel) ? linksAnalysis.tel.length : 0,
    downloadLinks: Array.isArray(linksAnalysis?.downloadLinks) ? linksAnalysis.downloadLinks.length : 0,
    brokenLinks: Array.isArray(linksAnalysis?.broken) ? linksAnalysis.broken : [],

    // Images broken & largest
    brokenImages: Array.isArray(brokenImages) ? brokenImages : [],
    largestImages: Array.isArray(largestImages) ? largestImages : [],
    imageFormats: accessibility?.formats || {},
    totalImages: accessibility?.totalImages ?? images ?? 0,

    recommendations: Array.isArray(recommendations) ? recommendations : [],

    ariaIssues: Array.isArray(accessibility?.ariaIssues) ? accessibility.ariaIssues : (Array.isArray(ariaIssues) ? ariaIssues : []),

    // raw debug info (safe)
    _raw: {
      seo: seo || {},
      links: linksAnalysis || {},
      accessibility: accessibility || {},
      security: security || {},
      perf: perf || {},
      httpResponse: {
        statusCode: statusCode ?? 0,
        responseTime: responseTime ?? 0,
        pageSize: pageSize ?? 0,
      },
    },
  };

  return result;
}

