const Cart = require('../models/Cart');

// ─── GET cart for logged-in user ────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    return res.json(cart ? cart.items : []);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch cart.' });
  }
};

// ─── SYNC: merge guest cart with DB cart on login ───────────────────────────
// Accepts: { items: [{ productId, name, price, image, size, color, quantity }] }
const syncCart = async (req, res) => {
  const { items: guestItems = [] } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Brand new user — just save whatever the guest had
      cart = await Cart.create({ user: req.user.id, items: guestItems });
    } else {
      // Merge: for each guest item, add to existing or bump quantity
      for (const guestItem of guestItems) {
        const existing = cart.items.find(
          i =>
            String(i.productId) === String(guestItem.productId) &&
            i.size === guestItem.size &&
            i.color === guestItem.color
        );
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          cart.items.push(guestItem);
        }
      }
      await cart.save();
    }

    return res.json(cart.items);
  } catch (error) {
    console.error('Cart sync error:', error);
    return res.status(500).json({ message: 'Failed to sync cart.' });
  }
};

// ─── SAVE full cart state to DB ──────────────────────────────────────────────
// Accepts: { items: [...] } — replaces the entire cart in DB
const saveCart = async (req, res) => {
  const { items = [] } = req.body;
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json(cart.items);
  } catch (error) {
    console.error('Cart save error:', error);
    return res.status(500).json({ message: 'Failed to save cart.' });
  }
};

module.exports = { getCart, syncCart, saveCart };
