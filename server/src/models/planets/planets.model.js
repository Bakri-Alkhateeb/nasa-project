const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const Planet = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    const parser = fs
      .createReadStream(
        path.join(__dirname, "..", "..", "..", "data", "kepler_data.csv")
      )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      );

    parser.on("data", async (data) => {
      if (isHabitablePlanet(data)) {
        await savePlanet(data);
      }
    });

    parser.on("error", (err) => {
      reject(err);
    });

    parser.on("end", () => {
      resolve();
    });
  });
}

async function savePlanet(planet) {
  try {
    const dataToInsert = {
      keplerName: planet.keplerName,
    };

    await Planet.updateOne(dataToInsert, dataToInsert, {
      upsert: true,
    });
  } catch (err) {
    console.error(`Couldn't Save Planet ${err}`);
  }
}

async function getAllPlanets() {
  return Planet.find({}, "-_id -__v -createdAt -updatedAt");
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
