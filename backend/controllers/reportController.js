import { createReport, listReportsByUser, getReportById, deleteReportById } from '../models/reportModel.js';

export async function saveReport(req, res) {
  try {
    const userId = req.user.id;
    const body = req.body;
    if (!body || !body.websiteURL) return res.status(400).json({ success: false, message: 'websiteURL required' });
    const rec = {
      userId,
      websiteURL: body.websiteURL,
      overallScore: Number(body.overallScore) || 0,
      grade: body.grade || null,
      seoScore: Number(body.seoScore) || 0,
      performanceScore: Number(body.performanceScore) || 0,
      accessibilityScore: Number(body.accessibilityScore) || 0,
      securityScore: Number(body.securityScore) || 0,
      fullReportJSON: body.fullReportJSON || body.fullReport || body.report || {},
      createdAt: new Date().toISOString()
    };
    const saved = await createReport(rec);
    return res.json({ success: true, report: saved });
  } catch (err) {
    console.error('Save report error', err?.message || err);
    return res.status(500).json({ success: false, message: 'Failed to save' });
  }
}

export async function listReports(req, res) {
  try {
    const userId = req.user.id;
    const list = await listReportsByUser(userId, 100);
    return res.json({ success: true, reports: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to list' });
  }
}

export async function getReport(req, res) {
  try {
    const id = req.params.id;
    const rep = await getReportById(id);
    if (!rep) return res.status(404).json({ success: false, message: 'Not found' });
    if (rep.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    return res.json({ success: true, report: rep });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
}

export async function deleteReport(req, res) {
  try {
    const id = req.params.id;
    const rep = await getReportById(id);
    if (!rep) return res.status(404).json({ success: false, message: 'Not found' });
    if (rep.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const ok = await deleteReportById(id);
    return res.json({ success: ok, message: ok ? 'Deleted' : 'Failed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
}
