const mongoose = require("mongoose");
const testURL = require("../../lib/testURL");
const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: { type: String, required: true, default: "Default" },
  avatar: {
    type: String,
    required: true,
    default:
      "https://bodiez.com/wp-content/uploads/2015/09/medium-default-avatar.png"
  },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Test URL

UserSchema.path("avatar").validate(val => {
  return testURL(val);
}, "Invalid URL.");

module.exports = mongoose.model("User", UserSchema);
