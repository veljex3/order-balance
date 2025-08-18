const mongoose = require("mongoose");

const databaseURL = "mongodb://127.0.0.1:27017/OrderBalance";

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(databaseURL); // will change later

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDatabase;
