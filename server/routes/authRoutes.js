const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "studentmart_dev_secret";

// Turn any error into a clear JSON message for the frontend
const sendError = (res, err) => {
  console.error(err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "field";
    if (field === "usn" || field === "email") {
      return res.status(400).json({ message: `An account with this ${field.toUpperCase()} already exists` });
    }
    return res.status(400).json({
      message: `Your database has an old unique index on "${field}". Delete the "users" collection in MongoDB and try again.`,
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }
  return res.status(500).json({ message: `Server error: ${err.message}` });
};

// Verify "Authorization: Bearer <token>"
const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in first" });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: "Session expired, please log in again" });
  }
};

const publicUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const usn = (req.body.usn || "").trim().toUpperCase();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!usn || !email || !password)
      return res.status(400).json({ message: "USN, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ $or: [{ email }, { usn }] });
    if (exists) {
      const field = exists.email === email ? "email" : "USN";
      return res.status(400).json({ message: `An account with this ${field} already exists` });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ usn, email, password: hashed });
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    sendError(res, err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/auth/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Account not found, please log in again" });
    res.json(publicUser(user));
  } catch (err) {
    sendError(res, err);
  }
});

// PUT /api/auth/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, phone, college, course, semester } = req.body;
    const update = { name, phone, college, course, semester };
    if (email) update.email = email.trim().toLowerCase();

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true });
    if (!user) return res.status(401).json({ message: "Account not found, please log in again" });
    res.json({ message: "Profile updated successfully", user: publicUser(user) });
  } catch (err) {
    sendError(res, err);
  }
});

// PUT /api/auth/change-password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "Account not found, please log in again" });

    const ok = await bcrypt.compare(currentPassword || "", user.password);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
