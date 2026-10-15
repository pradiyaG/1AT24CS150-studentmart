const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    usn: { type: String, required: true, unique: true, trim: true, uppercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    college: { type: String, default: "" },
    course: { type: String, default: "" },
    semester: { type: String, default: "1st Year" },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
