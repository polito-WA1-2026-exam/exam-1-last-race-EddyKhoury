// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";

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

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});