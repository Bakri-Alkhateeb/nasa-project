const mongoose = require("mongoose");
const { Schema } = mongoose;

const launchesSchema = new Schema(
  {
    flightNumber: { type: Number, required: true },
    launchDate: { type: Date, required: true },
    mission: { type: String, required: true },
    rocket: { type: String, required: true },
    target: { type: String, required: false },
    customers: [String],
    upcoming: { type: Boolean, required: true },
    success: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const Launch = mongoose.model("Launch", launchesSchema);

module.exports = Launch;
