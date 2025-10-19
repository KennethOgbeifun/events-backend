const db = require("../connection");
const seed = require("./seed");

const ENV = process.env.NODE_ENV || "development";
const data = ENV === "test" ? require("../data/test") : require("../data/development");

seed(data)
  .then((state) => {
    console.log(`Seed complete for ${ENV}`);
    if (state) console.log('events:', (data.events || []).length);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.end());
