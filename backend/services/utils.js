import axios from "axios";

export const DEFAULT_TIMEOUT = 10000;

export function safeTrim(str) {
  return (str || "").toString().trim();
}

export async function probeUrlStatus(href) {
  try {
    const resp = await axios.head(href, { timeout: 5000, maxRedirects: 5, validateStatus: () => true });
    return resp.status;
  } catch (err) {
    // try get as fallback
    try {
      const resp = await axios.get(href, { timeout: 5000, maxRedirects: 5, validateStatus: () => true });
      return resp.status;
    } catch (e) {
      return null;
    }
  }
}

export async function probeContentLength(href) {
  try {
    const resp = await axios.head(href, { timeout: 5000, maxRedirects: 5, validateStatus: () => true });
    const cl = resp.headers && (resp.headers['content-length'] || resp.headers['Content-Length']);
    if (cl) return parseInt(cl, 10);
    // fallback to GET but do not download body fully
    const r2 = await axios.get(href, { timeout: 5000, maxRedirects: 5, responseType: 'arraybuffer', validateStatus: () => true });
    return r2.data ? r2.data.byteLength : null;
  } catch (e) {
    return null;
  }
}
