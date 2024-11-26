const express = require("express");
const dotenv = require("dotenv");
const emailRoute = require("./routes/mailRoute");
const cors = require('cors');
const bodyParser = require('body-parser');
dotenv.config();

const app = express();

// Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: ['https://webknot-webflow.webflow.io'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Routes
app.use("/api", emailRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
