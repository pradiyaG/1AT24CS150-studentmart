const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const clean = (u) => ({
  _id: u._id,
  usn: u.usn,
  email: u.email,
  phone: u.phone,
  address: u.address,
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { usn, email, password, phone, address } = req.body;
    if (!usn || !email || !password)
      return res.status(400).json({ message: "USN, email and password are required" });

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { usn }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ usn, email, password: hashed, phone, address });
    res.status(201).json({ token: sign(user._id), user: clean(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(400).json({ message: "Invalid email or password" });
    res.json({ token: sign(user._id), user: clean(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Current user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(clean(user));
});

// Update profile
router.put("/me", auth, async (req, res) => {
  try {
    const { usn, email, phone, address } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (usn) user.usn = usn;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    await user.save();
    res.json(clean(user));
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? "USN or email already in use" : err.message });
  }
});

// Change password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!(await bcrypt.compare(currentPassword || "", user.password)))
      return res.status(400).json({ message: "Current password is incorrect" });
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
