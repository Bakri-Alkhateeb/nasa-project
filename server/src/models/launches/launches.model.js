const Launch = require("./launches.mongo");
const Planet = require("../planets/planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  const dataQuery = {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  };

  const response = await axios.post(SPACEX_API_URL, dataQuery);

  if (response.status !== 200) {
    console.log("Problem downloading data");
    throw new Error("Launch Data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      customers: customers,
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      target: "asd",
    };

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  try {
    const firstLaunch = await findLaunch({
      flightNumber: 1,
      rocket: "Falcon 9",
      mission: "FalconSat",
    });

    if (firstLaunch) {
      console.log("Launch Data Already Loaded");
    } else {
      await populateLaunches();
    }
  } catch (err) {
    console.error(err);
  }
}

async function findLaunch(filter) {
  return Launch.findOne(filter);
}

function getAllLaunches(skip, limit) {
  return Launch.find({}, "-_id -__v -createdAt -updatedAt")
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber(launchId) {
  // Sorting as DESC by -
  const latestLaunch = await Launch.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function addNewLaunch(launch) {
  const planet = await Planet.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("Planet Not Found");
  }

  try {
    // Set Properties Like This
    launch.flightNumber = (await getLatestFlightNumber()) + 1;
    launch.customers = ["Bakri", "NASA"];
    launch.upcoming = true;
    launch.success = true;

    await saveLaunch(launch);

    // Or Like This
    // launches.set(
    //   latestFlightNumber,
    //   Object.assign(launch, {
    //     customers: ['ZTM', 'NASA'],
    //     upcoming: true,
    //     success: true,
    //     flightNumber: latestFlightNumber,
    //   })
    // );
  } catch (err) {
    console.error(err);
  }
}

async function saveLaunch(launch) {
  await Launch.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function existsLaunchWithId(id) {
  return findLaunch({ flightNumber: id });
}

async function abortLaunchById(id) {
  const aborted = await Launch.updateOne(
    {
      flightNumber: id,
    },
    { upcoming: false, success: false }
  );

  console.log(aborted);

  return aborted.matchedCount === 1 && aborted.modifiedCount === 1;
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchesData,
};
