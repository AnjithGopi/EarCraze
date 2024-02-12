const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: [{ type: String }],
  catagory: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  is_active: { type: Number, default: 0 },
});


module.exports = mongoose.model("brand", brandSchema);
