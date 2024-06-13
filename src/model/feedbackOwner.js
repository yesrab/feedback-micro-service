const mongoose = require("mongoose");
const association = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
    },
    feedbacks: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Association = mongoose.model("Association", association);
module.exports = Association;
