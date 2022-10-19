const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  user: mongoose.SchemaTypes.ObjectId,
  title: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },

  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("notes", NoteSchema);
