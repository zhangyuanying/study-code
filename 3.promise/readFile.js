const fs = require("fs").promises;
const path = require("path");
const Promise = require("./promise");

Promise.all([
  8,
  fs.readFile(path.resolve(__dirname, "note.md"), "utf8"),
  10
]).then(
  data => {
    console.log("data", data);
  },
  err => {
    console.log("err", err);
  }
);

Promise.race(1)
