// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";

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
} from "./dao.js";

import { param, validationResult } from "express-validator";
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

app.use(
  session({
    secret: "last-race-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const localStrategy = LocalStrategy.Strategy;

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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware used to protect APIs that require login
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: "Not authenticated" });
};
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  next();
};
// POST /api/sessions
// Login
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

// GET /api/sessions/current
// Check current logged-in user
app.get("/api/sessions/current", isLoggedIn, (req, res) => {
  res.status(200).json(req.user);
});

// DELETE /api/sessions/current
// Logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

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

// SECTION 5 - Protected network and game creation APIs

app.get("/api/network/full", isLoggedIn, async (req, res) => {
  try {
    const network = await getFullNetwork();
    res.json(network);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/games", isLoggedIn, async (req, res) => {
  try {
    const game = await createGame(req.user.id);
    res.status(201).json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});