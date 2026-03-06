const Review = require('../models/Review');
const Listing = require('../models/Listing');

/**
 * GET /api/listings/:listingId/reviews
 * İlanın onaylı yorumlarını listeler (public).
 */
async function listByListing(req, res) {
  try {
    const listingId = req.params.id;
    const reviews = await Review.find({
      listing_id: listingId,
      is_approved: true,
    })
      .populate('user_id', 'username')
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Review list error:', err);
    res.status(500).json({ success: false, message: 'Yorumlar listelenirken hata oluştu.' });
  }
}

/**
 * POST /api/listings/:listingId/reviews
 * Yorum ekle (authenticate gerekli). is_approved varsayılan false (admin onayı).
 */
async function create(req, res) {
  try {
    const listingId = req.params.id;
    const { comment_text, rating } = req.body;
    const userId = req.user._id;

    if (!comment_text?.trim()) {
      return res.status(400).json({ success: false, message: 'Yorum metni gerekli.' });
    }
    const r = Math.round(Number(rating));
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Puan 1-5 arası olmalı.' });
    }

    const listing = await Listing.findById(listingId).select('_id');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    const review = await Review.create({
      listing_id: listingId,
      user_id: userId,
      comment_text: comment_text.trim(),
      rating: r,
      is_approved: false,
    });

    const populated = await Review.findById(review._id)
      .populate('user_id', 'username')
      .select('-__v')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Yorumunuz gönderildi. Onay sonrası yayınlanacaktır.',
      data: populated,
    });
  } catch (err) {
    console.error('Review create error:', err);
    res.status(500).json({ success: false, message: 'Yorum eklenirken hata oluştu.' });
  }
}

module.exports = { listByListing, create };
