require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDatabase = require("./database/database");

const app = express();

connectDatabase();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/order", require("./routes/order.route"));
app.use("/api/user", require("./routes/user.route"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
