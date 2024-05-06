const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    twitter_username: {
      type: String,
    },
    twitter_screen_name: {
      type: String,
    },
    twitter_photo: {
      type: String, 
    },
    email: {
      type: String,
    },
    wallet_address: {
      type: String,
    },
   
    referral_code: {
      type: String,
    },
    completedTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    pendingTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    points: {
      type: Number,
      default: 0,
    },
    referral_count: {
      type: Number,
      default: 0,
    },
    last_claim_date: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
