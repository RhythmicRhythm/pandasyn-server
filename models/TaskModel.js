const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  tasktype: {
    type: String,
  },
  platform: {
    type: String,
    enum: ["twitter", "discord", "instagram"],
  },
  description: {
    type: String,
  },
  twittertasktype: {
    type: String,
  },
  twitter_post_id: {
    type: String,
  },
  twitter_username: {
    type: String,
  },
  twitter_post: {
    type: String,
  },
  points: {
    type: Number,
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
