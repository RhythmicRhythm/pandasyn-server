const express = require("express");
const User = require("../models/UseModel");
const Task = require("../models/TaskModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// Function to generate unique referral code
function generateReferralCode(twitter_username) {
  const additionalCode = "SO"; // You can replace this with any additional code you want
  const combinedString = twitter_username + additionalCode;

  // Generate a hash using SHA256 algorithm
  const hash = crypto.createHash("sha256").update(combinedString).digest("hex");

  // Take first 8 characters of the hash as referral code
  const referralCode = hash.substring(0, 8);

  return referralCode;
}

router.post("/", async (req, res) => {
  const {
    twitter_username,
    twitter_screen_name,
    wallet_address,
    twitter_photo,
    referral_code,
  } = req.body;

  console.log(req.body);

  try {
    const twitterExists = await User.findOne({ twitter_username });

    if (twitterExists) {
      return res
        .status(404)
        .json({ message: "Twitter Account already applied" });
    }

    // Create the user
    const referralCode = generateReferralCode(twitter_username);
    const user = await User.create({
      twitter_username,
      twitter_screen_name,
      wallet_address,
      twitter_photo,
      referral_code: referralCode,
    });

    if (referral_code) {
      // Check if the referral code exists and is valid
      const referringUser = await User.findOne({ referral_code });
      if (!referringUser) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Update points for referring user and the referred user
      referringUser.points += 100;
      referringUser.referral_count += 1;
      await referringUser.save();
      user.points += 100;
    }

    // user.points += 1000;
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
    console.error(err);
  }
});

router.patch("/:userId/addEmail", async (req, res) => {
  const { userId } = req.params;
  const { email } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the email to the user
    user.email = email;
    await user.save();

    res.status(200).json({ message: "Email added successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const user = await User.find();
    res.status(201).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.get("/:twitter_username", async (req, res) => {
  const { twitter_username } = req.params;

  try {
    const user = await User.findOne({ twitter_username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/claim-points/:userId", async (req, res) => {
  // const userId = req.body.userId; // Assuming you have a userId in the request body

  try {
    // Find the user by userId
    // const user = await User.findById(userId);
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already claimed points within the last 24 hours
    const lastClaimDate = user.last_claim_date || new Date(0); // Default to a past date if last_claim_date is not set
    const now = new Date();
    const timeDiff = Math.abs(now - lastClaimDate);
    const hoursDiff = Math.floor(timeDiff / (1000 * 3600));

    if (hoursDiff < 24) {
      return res
        .status(400)
        .json({ message: "Points already claimed within the last 24 hours" });
    }

    // Add points to the user
    user.points += 100;
    user.last_claim_date = now;
    await user.save();

    res
      .status(200)
      .json({ message: "Points claimed successfully", points: user.points });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:userId/completedTasks", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "completedTasks"
    );
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.send(user.completedTasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:userId/pendingTasks", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "pendingTasks"
    );
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.send(user.pendingTasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:userId/tasks", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Fetch all tasks
    const allTasks = await Task.find();

    // Filter out tasks that user has completed
    const tasksNotCompleted = allTasks.filter(
      (task) => !user.completedTasks.includes(task._id)
    );

    res.send(tasksNotCompleted);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/:userId/completeTask/:taskId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const task = await Task.findById(req.params.taskId);

    if (!user || !task) {
      return res.status(404).send();
    }

    if (user.completedTasks.includes(task._id)) {
      return res.status(400).send("Task already completed by user.");
    }

    if (user.pendingTasks.includes(task._id)) {
      return res.status(400).send("Task verification pending.");
    }

    // Add the task to the user's pending tasks
    user.pendingTasks.push(task._id);
    await user.save();

    // Set a timeout of 10 minutes to mark the task as completed
    setTimeout(async () => {
      // Remove the task from pending tasks
      user.pendingTasks.pull(task._id);

      // Add the task to completed tasks
      user.completedTasks.push(task._id);

      // Update user's points
      user.points += task.points;

      await user.save();
    }, 10 * 60 * 200); // 10 minutes delay

    res.send({
      message: "Task verication in progress, check back in a few min.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id); // findByIdAndDelete method

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Log any errors
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
