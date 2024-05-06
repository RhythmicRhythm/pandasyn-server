const express = require("express");
// const User = require("../models/UseModel");
const Task = require("../models/TaskModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

router.post("/addtask", async (req, res) => {
  const {
    name,
    tasktype,
    description,
    points,
    twitter_username,
    twittertasktype,
    twitter_post_id,
    twitter_post,
  } = req.body;
  try {
    const task = await Task.create({
      name,
      tasktype,
      description,
      points,
      twitter_username,
      twittertasktype,
      twitter_post_id,
      twitter_post,
    });

    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/alltask", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(201).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/:id/task", async (req, res) => {
  const { id } = req.params;
  try {
    const tasks = await Task.findById(id);
    res.status(201).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:id/task", async (req, res) => {
  const { id } = req.params;
  try {
    const tasks = await Task.findByIdAndDelete(id);
    res.status(201).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
