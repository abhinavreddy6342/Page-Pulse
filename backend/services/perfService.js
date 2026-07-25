export function analyzePerformance(response, responseTime, pageSize) {
  const headers = {};
  Object.keys(response.headers || {}).forEach(k => headers[k.toLowerCase()] = response.headers[k]);

  const contentType = headers['content-type'] || null;
  const compression = headers['content-encoding'] || null;
  const encoding = headers['transfer-encoding'] || null;
  const redirectCount = response.request && response.request._redirectable ? response.request._redirectable._redirectCount || 0 : 0;
  const finalUrl = (response.request && response.request.res && response.request.res.responseUrl) || response.config?.url || null;

  // Performance score using explicit response time buckets (requested)
  // 0-500ms => 100
  // 500-1000ms => 90
  // 1000-2000ms => 70
  // 2000-3000ms => 50
  // 3000+ => 30
  let perfScore = 0;
  if (responseTime <= 500) perfScore = 100;
  else if (responseTime <= 1000) perfScore = 90;
  else if (responseTime <= 2000) perfScore = 70;
  else if (responseTime <= 3000) perfScore = 50;
  else perfScore = 30;

  const rating = perfScore >= 90 ? 'Excellent' : perfScore >= 70 ? 'Good' : perfScore >= 50 ? 'Average' : 'Poor';

  // Estimated download time assuming 1 Mbps (125 KB/s)
  const estimatedDownloadTimeSec = pageSize > 0 ? Math.round((pageSize / 125000) * 1000) / 1000 : 0;

  return { contentType, compression, encoding, redirectCount, finalUrl, performanceScore: perfScore, performanceRating: rating, estimatedDownloadTimeSec };
}

