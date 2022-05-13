const path = require("path");
const express = require("express");
// const morgan = require("morgan");
const api = require("./routes/api");

const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
// app.use(morgan("combined"));

app.use("/v1", api);
app.get("/*", (req, res, nex) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
