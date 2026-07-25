import { analyze } from "../services/analyzeService.js";

function normalizeReport(r) {
  const rep = r || {};
  return {
    // Basic
    title: rep.title ?? null,
    metaDescription: rep.metaDescription ?? null,
    statusCode: rep.statusCode ?? null,
    responseTime: rep.responseTime ?? null,
    pageSize: rep.pageSize ?? 0,
    wordCount: rep.wordCount ?? 0,

    // counts
    h1: rep.h1 ?? 0,
    h2: rep.h2 ?? 0,
    headings: (rep.h1 ?? 0) + (rep.h2 ?? 0),
    links: rep.links ?? 0,
    images: rep.images ?? 0,
    imagesWithoutAlt: rep.imagesWithoutAlt ?? rep.missingAltImages ?? 0,

    // Scores and arrays
    seoScore: rep.seoScore ?? 0,
    seoChecks: Array.isArray(rep.seoChecks) ? rep.seoChecks : (Array.isArray(rep.seo?.seoChecks) ? rep.seo.seoChecks : []),
    seoRecommendations: Array.isArray(rep.seoRecommendations) ? rep.seoRecommendations : (Array.isArray(rep.seo?.seoRecommendations) ? rep.seo.seoRecommendations : []),

    performanceScore: rep.performanceScore ?? 0,
    performanceRating: rep.performanceRating ?? null,

    accessibilityScore: rep.accessibilityScore ?? (rep.accessibility?.altCoverage ?? null),
    accessibilityChecks: Array.isArray(rep.accessibilityChecks) ? rep.accessibilityChecks : (Array.isArray(rep.accessibility?.checks) ? rep.accessibility.checks : []),
    accessibility: rep.accessibility ?? {},

    // new SEO shapes
    open_graph: rep.open_graph ?? (rep.og ? { exists: Object.keys(rep.og).length > 0, title: rep.og.title || null, description: rep.og.description || null, image: rep.og.image || null } : { exists: false, title: null, description: null, image: null }),
    twitter_card: rep.twitter_card ?? (rep.twitter ? { exists: Object.keys(rep.twitter).length > 0, title: rep.twitter.title || null, description: rep.twitter.description || null, image: rep.twitter.image || null } : { exists: false, title: null, description: null, image: null }),
    structured_data: rep.structured_data ?? (Array.isArray(rep.structuredData) ? { exists: rep.structuredData.length > 0, schemas: rep.structuredData } : { exists: false, schemas: [] }),

    securityScore: rep.securityScore ?? 0,
    securityHeaders: rep.securityHeaders ?? {},
    securityDetails: Array.isArray(rep.securityDetails) ? rep.securityDetails : (Array.isArray(rep.security?.details) ? rep.security.details : []),

    internalLinks: rep.internalLinks ?? 0,
    externalLinks: rep.externalLinks ?? 0,
    brokenLinks: Array.isArray(rep.brokenLinks) ? rep.brokenLinks : [],
    brokenImages: Array.isArray(rep.brokenImages) ? rep.brokenImages : [],
    largestImages: Array.isArray(rep.largestImages) ? rep.largestImages : [],

    recommendations: Array.isArray(rep.recommendations) ? rep.recommendations : (Array.isArray(rep.recs) ? rep.recs : []),

    og: rep.og ?? {},
    twitter: rep.twitter ?? {},
    structuredData: Array.isArray(rep.structuredData) ? rep.structuredData : [],

    robotsTxtAvailable: !!rep.robotsTxtAvailable,
    sitemapAvailable: !!rep.sitemapAvailable,

    // aria issues
    ariaIssues: Array.isArray(rep.accessibility?.ariaIssues) ? rep.accessibility.ariaIssues : (Array.isArray(rep.ariaIssues) ? rep.ariaIssues : []),

    // include raw for debugging if needed
    _raw: rep,
  };
}

export const analyzeWebsite = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: "URL is required" });
  }

  try {
    const report = await analyze(url);
    const normalized = normalizeReport(report);
    return res.json({ success: true, ...normalized });
  } catch (err) {
    console.error("Analyze error:", err?.message || err);
    return res.status(500).json({ success: false, message: err?.message || "Internal Server Error" });
  }
};
