const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// Stock is reserved while an item sits in the cart (13 -> 12 after adding one),
// and returned to the product when it is removed / the cart is cleared.

const getCart = async (userId) =>
  (await Cart.findOne({ user: userId })) || (await Cart.create({ user: userId, items: [] }));

const respond = async (res, cart) => {
  const populated = await Cart.findById(cart._id).populate("items.product");
  const items = populated.items.filter((i) => i.product);
  res.json({
    items,
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.quantity * i.product.price, 0),
  });
};

router.get("/", async (req, res) => {
  try {
    await respond(res, await getCart(req.userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add one unit
router.post("/add", async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.body.productId, stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { new: true }
    );
    if (!product) return res.status(400).json({ message: "Product is out of stock" });

    const cart = await getCart(req.userId);
    const item = cart.items.find((i) => i.product.toString() === product._id.toString());
    if (item) item.quantity += 1;
    else cart.items.push({ product: product._id, quantity: 1 });
    await cart.save();
    await respond(res, cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Increase / decrease by one: { productId, action: "inc" | "dec" }
router.put("/update", async (req, res) => {
  try {
    const { productId, action } = req.body;
    const cart = await getCart(req.userId);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (action === "inc") {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: 1 } },
        { $inc: { stock: -1 } }
      );
      if (!product) return res.status(400).json({ message: "No more stock available" });
      item.quantity += 1;
    } else if (action === "dec" && item.quantity > 1) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: 1 } });
      item.quantity -= 1;
    }
    await cart.save();
    await respond(res, cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove one product line
router.delete("/remove/:productId", async (req, res) => {
  try {
    const cart = await getCart(req.userId);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (item) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      cart.items = cart.items.filter((i) => i !== item);
      await cart.save();
    }
    await respond(res, cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clear cart
router.delete("/clear", async (req, res) => {
  try {
    const cart = await getCart(req.userId);
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    cart.items = [];
    await cart.save();
    await respond(res, cart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
