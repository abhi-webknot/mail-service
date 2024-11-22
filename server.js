const express = require("express");
const dotenv = require("dotenv");
const emailRoute = require("./routes/mailRoute");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api", emailRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
