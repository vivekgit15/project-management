const mongoose = require("mongoose");

let isConnected = false;

const connectToDB = async () => {

  try {

    if (isConnected) {
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;

    console.log("MongoDB connected:", conn.connection.name);

  } catch (error) {

    console.error("MongoDB connection error:", error.message);
    process.exit(1);

  }

};

module.exports = connectToDB;
