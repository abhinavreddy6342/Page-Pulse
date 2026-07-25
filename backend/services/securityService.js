export function analyzeSecurity(headers, url) {
  const h = {};
  Object.keys(headers || {}).forEach(k => h[k.toLowerCase()] = headers[k]);

  const securityHeaders = {
    csp: h['content-security-policy'] || null,
    hsts: h['strict-transport-security'] || null,
    referrerPolicy: h['referrer-policy'] || null,
    xFrameOptions: h['x-frame-options'] || null,
    xContentTypeOptions: h['x-content-type-options'] || null,
    permissionsPolicy: h['permissions-policy'] || null,
    crossOriginEmbedderPolicy: h['cross-origin-embedder-policy'] || null,
    crossOriginOpenerPolicy: h['cross-origin-opener-policy'] || null,
    crossOriginResourcePolicy: h['cross-origin-resource-policy'] || null,
  };

  const https = new URL(url).protocol === 'https:';
  const checks = {
    https,
    csp: !!securityHeaders.csp,
    hsts: !!securityHeaders.hsts,
    referrerPolicy: !!securityHeaders.referrerPolicy,
    xFrameOptions: !!securityHeaders.xFrameOptions,
    xContentTypeOptions: !!securityHeaders.xContentTypeOptions,
    permissionsPolicy: !!securityHeaders.permissionsPolicy,
  };

  const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);

  const details = [];
  Object.keys(checks).forEach(k => {
    details.push({ name: k, present: !!checks[k], value: securityHeaders[k] || null, importance: importanceFor(k) });
  });

  return { securityHeaders, checks, securityScore: score, details };
}

function importanceFor(name) {
  switch (name) {
    case 'https': return 'High';
    case 'hsts': return 'High';
    case 'csp': return 'High';
    case 'xFrameOptions': return 'Medium';
    case 'xContentTypeOptions': return 'Medium';
    case 'referrerPolicy': return 'Low';
    default: return 'Low';
  }
}
