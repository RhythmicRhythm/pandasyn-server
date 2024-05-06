const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRoute = require("./routes/userRoute");
const taskRoute = require("./routes/taskRoute");
const m_codeRoute = require("./routes/M-codeRoute");

const bodyParser = require("body-parser");

// Middlewares
app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: false }));

// cors
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "*",
      "https://pandasynn.netlify.app",
      "https://solcializeadmin.netlify.app",
    ],
    credentials: true,
  })
);

// Routes Middleware
app.use("/", userRoute);
app.use("/task", taskRoute);
app.use("/code", m_codeRoute);


// Routes
app.get("/", (req, res) => {
  res.send("Home Page");
});

//Error Middleware
// app.use(errorHandler);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
