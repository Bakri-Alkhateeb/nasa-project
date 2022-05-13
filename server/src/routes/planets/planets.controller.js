const planetsModel = require("../../models/planets/planets.model");

const getAllPlanets = async (req, res, next) => {
  const result = await planetsModel.getAllPlanets();

  return res.status(200).json(result);
};

module.exports = {
  getAllPlanets,
};
