const mongoose = require("mongoose");

const m_codeSchema = new mongoose.Schema({
  code: {
    type: String,
  },
  uses: {
    type: Number,
  },
  points: {
    type: Number,
  },
});

const M_Code = mongoose.model("M_Code", m_codeSchema);

module.exports = M_Code;
