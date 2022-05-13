const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;
mongoose.connection.once("open", () => {});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB Error: ${err}`);
});

async function connectToMongoDB() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function disconnectToMongoDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectToMongoDB,
  disconnectToMongoDB,
};
