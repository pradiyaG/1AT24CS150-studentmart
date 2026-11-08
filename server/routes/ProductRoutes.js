const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// All products
router.get("/", async (req, res) => {
  try {
    res.json(await Product.find().sort({ createdAt: 1 }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(404).json({ message: "Product not found" });
  }
});

// Add product
router.post("/", auth, async (req, res) => {
  try {
    const { name, category, price, stock, description, image } = req.body;
    if (!name || !category || price === "" || stock === "" || !description)
      return res.status(400).json({ message: "Please fill all required fields" });
    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      image,
      createdBy: req.userId,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product
router.delete("/:id", auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
