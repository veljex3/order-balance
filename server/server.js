const express = require("express");
const connectDatabase = require("./database/database");

const app = express();

connectDatabase();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
