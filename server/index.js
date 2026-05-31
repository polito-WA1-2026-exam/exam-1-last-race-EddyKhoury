// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { getAllStations, getAllSegments } from "./dao.js";

// init express
const app = new express();
const port = 3001;

app.use(morgan("dev"));
app.use(express.json());


//  The React client runs on http://localhost:5173.
// x   The Express server runs on http://localhost:3001.
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

//Temporary test API. This confirms that the server is running and that the client will later be able to call /api/... endpoints
app.get("/api/test", (req, res) => {
  res.json({
    message: "Last Race server is running",
  });
});


// Temporary debug API for Section 3.
// This confirms that dao.js can read stations from the SQLite database.
app.get("/api/debug/stations", async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error while loading stations" });
  }
});

// Temporary debug API for Section 3.
// This confirms that dao.js can read segments from the SQLite database.
app.get("/api/debug/segments", async (req, res) => {
  try {
    const segments = await getAllSegments();
    res.json(segments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error while loading segments" });
  }
});
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});