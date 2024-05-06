const express = require("express");
const M_Code = require("../models/M_CodeModel");
const User = require("../models/UseModel");
const router = express.Router();
const crypto = require("crypto");

// Function to generate unique referral code
function generateCode() {
  const additionalCode = "SO"; // You can replace this with any additional code you want
  const combinedString = additionalCode;

  // Generate a hash using SHA256 algorithm
  const hash = crypto.createHash("sha256").update(combinedString).digest("hex");

  // Take first 8 characters of the hash as referral code
  const code = hash.substring(0, 14);

  return code;
}

router.post("/newcode", async (req, res) => {
  const { uses, points } = req.body;
  try {
    const Code = generateCode();
    const m_code = await M_Code.create({
      code: Code,
      uses,
      points,
    });

    res.status(201).send(m_code);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/allcodes", async (req, res) => {
  try {
    const codes = await M_Code.find();
    res.status(201).send(codes);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/redeem/:userId", async (req, res) => {
  const { code } = req.body;

  try {
    const codeDoc = await M_Code.findOne({ code });
    const user = await User.findById(req.params.userId);

    if (!codeDoc) {
      return res.status(404).json({ message: "Code not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (codeDoc.uses <= 0) {
      return res.status(400).json({ message: "Code Usge Limit Ecsceeded" });
    }

    user.points += codeDoc.points;
    await user.save();

    // Decrease the number of uses by 1
    codeDoc.uses -= 1;
    await codeDoc.save();

    return res.status(200).json({ message: "Sucessfully Redeemed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
