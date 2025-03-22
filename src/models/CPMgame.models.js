const mongoose = require('mongoose');

// * Rectangle Schema Definition
const RectangleSchema = new mongoose.Schema({
  startX: Number,
  startY: Number,
  endX: Number,
  endY: Number,
  value: Number
});

// * Game Schema Definition
const GameSchema = new mongoose.Schema({
  boardId: { type: String, required: true, unique: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  board: [[Number]],
  rectangles: [RectangleSchema],
  solution: [RectangleSchema],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  isComplete: { type: Boolean, default: false },
  elapsedTime: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema); 