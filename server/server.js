const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("StudentMart API is running"));
app.use("/api/auth", authRoutes);

// Unknown API route -> JSON (so the frontend shows a clear message)
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmart";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("\nCould not connect to MongoDB:", err.message);
    console.error("Check that MongoDB is running, or set MONGO_URI in server/.env to your Atlas connection string.\n");
    process.exit(1);
  });
