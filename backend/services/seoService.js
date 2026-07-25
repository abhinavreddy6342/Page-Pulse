import { safeTrim } from "./utils.js";

export function analyzeSEO($, html, baseUrl) {
  const title = safeTrim($("title").first().text()) || null;
  const metaDescription = safeTrim($('meta[name="description"]').attr("content")) || null;

  const titleLen = title ? title.length : 0;
  const titleLenOk = titleLen >= 10 && titleLen <= 60;

  const metaDescLen = metaDescription ? metaDescription.length : 0;
  const metaDescLenOk = metaDescLen >= 50 && metaDescLen <= 160;

  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const hasCharset = Boolean($('meta[charset]').attr('charset')) || Boolean($('meta[http-equiv="Content-Type"]').attr('content'));
  const htmlLang = $('html').attr('lang') || null;
  const hasFavicon = $('link[rel~="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0;

  // Open Graph tags (legacy shape kept as 'og')
  const og = {};
  ['title','description','image','url','type','site_name'].forEach(k => {
    const val = $(`meta[property="og:${k}"]`).attr('content');
    if (val) og[k] = safeTrim(val);
  });

  // Also provide new open_graph shape required by the client
  const open_graph = {
    exists: Object.keys(og).length > 0,
    title: og.title || null,
    description: og.description || null,
    image: og.image || null,
  };

  // Twitter card (legacy 'twitter')
  const twitter = {};
  ['card','title','description','image'].forEach(k => {
    const val = $(`meta[name="twitter:${k}"]`).attr('content');
    if (val) twitter[k] = safeTrim(val);
  });

  // New twitter_card shape
  const twitter_card = {
    exists: Object.keys(twitter).length > 0,
    title: twitter.title || null,
    description: twitter.description || null,
    image: twitter.image || null,
  };

  // Structured data (JSON-LD)
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const structuredData = [];
  jsonLdScripts.each((i, el) => {
    const txt = safeTrim($(el).contents().text());
    if (!txt) return;
    try {
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => structuredData.push(p));
      } else {
        structuredData.push(parsed);
      }
    } catch (e) {
      // ignore malformed
      structuredData.push({ raw: txt });
    }
  });

  // New structured_data shape
  const structured_data = {
    exists: structuredData.length > 0,
    schemas: structuredData,
  };

  // Robots meta
  const hasRobotsMeta = $('meta[name="robots"]').length > 0;

  const seoChecks = [];
  seoChecks.push({ name: "title", passed: Boolean(title), details: title || null });
  seoChecks.push({ name: "title_length", passed: titleLenOk, details: titleLen });
  seoChecks.push({ name: "meta_description", passed: Boolean(metaDescription), details: metaDescription || null });
  seoChecks.push({ name: "meta_description_length", passed: metaDescLenOk, details: metaDescLen });
  seoChecks.push({ name: "viewport", passed: hasViewport });
  seoChecks.push({ name: "canonical", passed: hasCanonical });
  seoChecks.push({ name: "charset", passed: hasCharset });
  seoChecks.push({ name: "html_lang", passed: Boolean(htmlLang), details: htmlLang });
  seoChecks.push({ name: "favicon", passed: hasFavicon });
  seoChecks.push({ name: "open_graph", passed: Object.keys(og).length > 0, details: og });
  seoChecks.push({ name: "twitter_card", passed: Object.keys(twitter).length > 0, details: twitter });
  seoChecks.push({ name: "structured_data", passed: structuredData.length > 0, details: structuredData });
  seoChecks.push({ name: "robots_meta", passed: hasRobotsMeta });

  // robots.txt and sitemap.xml checked at higher level (caller)

  const totalSeoChecks = seoChecks.length;
  const passedSeoChecks = seoChecks.filter(c => c.passed).length;
  const seoScore = Math.round((passedSeoChecks / totalSeoChecks) * 100);

  const seoRecommendations = [];
  if (!title) seoRecommendations.push({ priority: 'High', problem: 'Missing title tag', recommendation: 'Add a <title> tag describing the page (10-60 chars).', fix: '<title>Your page title here</title>', docs: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title' });
  if (!titleLenOk) seoRecommendations.push({ priority: 'Medium', problem: 'Title length out of recommended range', recommendation: 'Keep title between 10 and 60 characters.', fix: '<title>Short but descriptive title</title>', docs: 'https://developers.google.com/search/docs/appearance/title-links' });
  if (!metaDescription) seoRecommendations.push({ priority: 'High', problem: 'Missing meta description', recommendation: 'Add a meta description (50-160 chars).', fix: '<meta name="description" content="Describe the page here">', docs: 'https://developers.google.com/search/docs/appearance/snippet' });
  if (!metaDescLenOk && metaDescription) seoRecommendations.push({ priority: 'Low', problem: 'Meta description length not ideal', recommendation: 'Keep description between 50 and 160 characters.', fix: '<meta name="description" content="...">', docs: 'https://developers.google.com/search/docs/appearance/snippet' });
  if (!hasViewport) seoRecommendations.push({ priority: 'High', problem: 'Missing viewport meta tag', recommendation: 'Add responsive viewport meta tag.', fix: '<meta name="viewport" content="width=device-width, initial-scale=1">', docs: 'https://developer.mozilla.org/en-US/docs/Mobile/Viewport_meta_tag' });

  return { title, metaDescription, seoChecks, seoScore, seoRecommendations, og, twitter, structuredData, htmlLang, open_graph, twitter_card, structured_data, hasViewport };

}
