const Wishlist = require('../models/Wishlist');
const Product  = require('../models/Product');

// ─── GET wishlist for logged-in user ─────────────────────────────────────────
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items');
    return res.json(wishlist ? wishlist.items : []);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch wishlist.' });
  }
};

// ─── SYNC: merge guest wishlist with DB wishlist on login ─────────────────────
// Accepts: { productIds: ['id1', 'id2', ...] }
const syncWishlist = async (req, res) => {
  const { productIds: guestIds = [] } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, items: guestIds });
    } else {
      // Add any guest items not already in the DB wishlist
      for (const id of guestIds) {
        const alreadyIn = wishlist.items.some(i => String(i) === String(id));
        if (!alreadyIn) wishlist.items.push(id);
      }
      await wishlist.save();
    }

    // Return fully populated product objects
    const populated = await wishlist.populate('items');
    return res.json(populated.items);
  } catch (error) {
    console.error('Wishlist sync error:', error);
    return res.status(500).json({ message: 'Failed to sync wishlist.' });
  }
};

// ─── SAVE full wishlist state to DB ──────────────────────────────────────────
// Accepts: { productIds: [...] }
const saveWishlist = async (req, res) => {
  const { productIds = [] } = req.body;
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { items: productIds },
      { new: true, upsert: true }
    ).populate('items');
    return res.json(wishlist.items);
  } catch (error) {
    console.error('Wishlist save error:', error);
    return res.status(500).json({ message: 'Failed to save wishlist.' });
  }
};

module.exports = { getWishlist, syncWishlist, saveWishlist };
