const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    subTitle: {
      type: String,
      required: true,
    },
    subContent: {
      type: String,
      required: true,
    },
    status :{
      type: String,
      enum : ["pending", "completed"],
      default : "pending"
    }
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    Contents: [contentSchema],
    status :{
      type: String,
      enum : ["pending", "completed"],
      default : "pending"
    }
  },
  { timestamps: true }
);

const Note = mongoose.model('notes', noteSchema);

module.exports = Note;