// ===============================
// Imports and dependencies
// ===============================

import express from "express"; // Used to create the server
import morgan from "morgan"; // Logs HTTP requests in the terminal
import cors from "cors"; // Allows frontend/backend communication
import passport from "passport"; // Authentication framework
import LocalStrategy from "passport-local"; // Email/password login strategy
import session from "express-session"; // Session cookies

import {
  getAllStations,
  getAllSegments,
  getUser,
  getUserById,
  getFullNetwork,
  createGame,
  getPlanningNetwork,
  getGameById,
  getRanking,
  submitRoute,
  getGameSteps,
} from "./dao.js";

import { param, body, validationResult } from "express-validator";


// ===============================
// Express app setup
// ===============================

const app = new express();
const port = 3001; // Backend listens on port 3001


// ===============================
// Global middleware and CORS
// ===============================

// Logs requests and status codes during development
app.use(morgan("dev"));

// Allows the server to read JSON request bodies
app.use(express.json());

// The React client runs on http://localhost:5173.
// The Express server runs on http://localhost:3001.
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Allows session cookies between client and server
};

app.use(cors(corsOptions));


// ===============================
// Session and Passport setup
// ===============================

// Creates the server-side session used by Passport
app.use(
  session({
    secret: "last-race-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initializes Passport and enables login sessions
app.use(passport.initialize());
app.use(passport.session());


// ===============================
// Passport local authentication strategy
// ===============================

const localStrategy = LocalStrategy.Strategy;

// Verifies user email and password during login
passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function verify(email, password, done) {
      try {
        const user = await getUser(email, password);

        if (!user) {
          return done(null, false, {
            message: "Incorrect email or password",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Stores only the user id in the session after login
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Reloads the safe user object from the database on later requests
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// ===============================
// Authentication and validation helpers
// ===============================

// Protects APIs that require a logged-in user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: "Not authenticated" });
};

// Checks express-validator results and returns 422 for invalid input
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  next();
};


// ===============================
// Authentication APIs
// ===============================

// Logs in a user using email and password
app.post("/api/sessions", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Incorrect email or password",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(201).json(req.user);
    });
  })(req, res, next);
});

// Returns the currently logged-in user
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  }

  return res.status(200).json(null);
});

// Logs out the current user
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});


// ===============================
// Development and debug endpoints
// ===============================

// Development health check used to confirm that the Express server is running
app.get("/api/test", (req, res) => {
  res.json({
    message: "Last Race server is running",
  });
});

// Temporary debug endpoint used to verify that dao.js can read stations from SQLite
app.get("/api/debug/stations", async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error while loading stations" });
  }
});

// Temporary debug endpoint used to verify that dao.js can read segments from SQLite
app.get("/api/debug/segments", async (req, res) => {
  try {
    const segments = await getAllSegments();
    res.json(segments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error while loading segments" });
  }
});


// ===============================
// Network and game creation APIs
// ===============================

// Returns the full network for the setup phase
app.get("/api/network/full", isLoggedIn, async (req, res) => {
  try {
    const network = await getFullNetwork();
    res.json(network);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Creates a new game for the logged-in user
app.post("/api/games", isLoggedIn, async (req, res) => {
  try {
    const game = await createGame(req.user.id);
    res.status(201).json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Returns planning-safe game data without line colors or line names
app.get(
  "/api/games/:id/planning",
  isLoggedIn,
  param("id").isInt({ min: 1 }).withMessage("Game id must be a positive integer"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const gameId = Number(req.params.id);
      const planningData = await getPlanningNetwork(gameId, req.user.id);

      if (!planningData) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(planningData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Returns one game belonging to the logged-in user
app.get(
  "/api/games/:id",
  isLoggedIn,
  param("id").isInt({ min: 1 }).withMessage("Game id must be a positive integer"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const gameId = Number(req.params.id);
      const game = await getGameById(gameId, req.user.id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(game);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


// ===============================
// Route submission and execution APIs
// ===============================

// Submits the planned route, validates it, and executes the game if valid
app.post(
  "/api/games/:id/route",
  isLoggedIn,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Game id must be a positive integer"),
  body("segments")
    .isArray()
    .withMessage("segments must be an array"),
  body("segments.*")
    .isInt({ min: 1 })
    .withMessage("Each segment id must be a positive integer")
    .toInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const gameId = Number(req.params.id);
      const segmentIds = req.body.segments;

      const result = await submitRoute(gameId, req.user.id, segmentIds);

      if (!result) {
        return res.status(404).json({ error: "Game not found" });
      }

      return res.status(200).json(result);
    } catch (err) {
      if (err.code === "GAME_NOT_SUBMITTABLE") {
        return res.status(409).json({ error: err.message });
      }

      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Returns the execution steps of a completed valid game
app.get(
  "/api/games/:id/steps",
  isLoggedIn,
  param("id")
    .isInt({ min: 1 })
    .withMessage("Game id must be a positive integer"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const gameId = Number(req.params.id);

      const game = await getGameById(gameId, req.user.id);

      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      const steps = await getGameSteps(gameId, req.user.id);

      return res.status(200).json(steps);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);


// ===============================
// Ranking API
// ===============================

// Returns the best completed score for each user
app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ===============================
// Server activation
// ===============================

// Starts the Express backend server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});