require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/ProductRoutes"));
app.use("/api/cart", require("./routes/CartRoutes"));

app.get("/", (req, res) => res.send("StudentMart API running"));

const PORT = process.env.PORT || 5002;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
