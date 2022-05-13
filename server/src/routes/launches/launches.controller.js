const launchesModel = require("../../models/launches/launches.model");
const { getPagination } = require("../../services/query");

async function getAllLaunches(req, res, next) {
  const { skip, limit } = getPagination(req.query);

  const launches = await launchesModel.getAllLaunches(skip, limit);

  return res.status(200).json(launches);
}

async function addNewLaunch(req, res, next) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid Launch Date",
    });
  }

  await launchesModel.addNewLaunch(launch);

  return res.status(201).json(launch);
}

async function abortLaunch(req, res, next) {
  // cast to number using +
  const launchId = +req.params.id;
  const existsLaunch = await launchesModel.existsLaunchWithId(launchId);

  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = await launchesModel.abortLaunchById(launchId);

  if (!aborted) {
    return res.status(400).json({
      error: "Could not abort launch",
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
};
