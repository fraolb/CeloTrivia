require("dotenv").config();
require("express-async-errors");
const express = require("express");
const connectDB = require("./db/connect");
const bodyParser = require("body-parser");
const questions = require("./routes/questions");
const prizes = require("./routes/prizes");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Home page
app.get("/api/v1", (req, res) => {
  res.send("Home page");
});

// Routes
app.use("/api/v1/trivia", questions);
app.use("/api/v1/prize", prizes);

// Start the server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
