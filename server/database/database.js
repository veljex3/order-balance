const mongoose = require("mongoose");

const uri = process.env.DATABASE_URI;

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(uri, {});

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDatabase;
