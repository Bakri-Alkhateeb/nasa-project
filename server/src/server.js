const http = require("http");
const app = require("./app");
require("dotenv").config();

const { loadPlanetsData } = require("./models/planets/planets.model");
const { loadLaunchesData } = require("./models/launches/launches.model");
const { connectToMongoDB } = require("./services/mongo");

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer() {
  await connectToMongoDB();

  await loadPlanetsData();

  await loadLaunchesData();

  server.listen(PORT);
}

startServer();
