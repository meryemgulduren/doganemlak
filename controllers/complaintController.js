const Complaint = require('../models/Complaint');

/** POST /api/complaints — Yeni talep/şikayet oluştur */
async function createComplaint(req, res) {
  try {
    const body = req.body || {};
    const { type, text, images } = body;
    if (!type || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tür ve açıklama gerekli.',
      });
    }

    const complaint = await Complaint.create({
      type,
      text: text.trim(),
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      user: req.user?._id || null,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: 'Talep oluşturulamadı.' });
  }
}

/** GET /api/admin/complaints — Tüm talep/şikayetleri listele (admin) */
async function getComplaints(req, res) {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const complaints = await Complaint.find(filter)
      .populate('user', 'username email phone first_name last_name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error('Get complaints error:', err);
    res.status(500).json({ success: false, message: 'Talepler alınamadı.' });
  }
}

/** PUT /api/admin/complaints/:id/status — Durum güncelle (admin) */
async function updateComplaintStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['BEKLEMEDE', 'INCELENIYOR', 'COZULDU'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Geçersiz durum.' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'username email phone first_name last_name');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error('Update complaint status error:', err);
    res.status(500).json({ success: false, message: 'Durum güncellenemedi.' });
  }
}

module.exports = { createComplaint, getComplaints, updateComplaintStatus };
