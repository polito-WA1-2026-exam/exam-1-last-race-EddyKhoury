import sqlite from "sqlite3";
import crypto from "crypto";

const db = new sqlite.Database("last-race.sqlite", (err) => {
  if (err) {
    throw err;
  }
});

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString("hex"));
      }
    });
  });
};

const createUser = async (id, email, name, plainPassword) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await hashPassword(plainPassword, salt);

  await run(
    `
    INSERT INTO user (id, email, name, password, salt)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id, email, name, hashedPassword, salt]
  );
};

const createTables = async () => {
  await run("PRAGMA foreign_keys = OFF");

  await run("DROP TABLE IF EXISTS game_step");
  await run("DROP TABLE IF EXISTS game");
  await run("DROP TABLE IF EXISTS event");
  await run("DROP TABLE IF EXISTS segment");
  await run("DROP TABLE IF EXISTS line_station");
  await run("DROP TABLE IF EXISTS line");
  await run("DROP TABLE IF EXISTS station");
  await run("DROP TABLE IF EXISTS user");

  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE user (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE station (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      x INTEGER NOT NULL,
      y INTEGER NOT NULL
    )
  `);

  await run(`
    CREATE TABLE line (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE line_station (
      lineId INTEGER NOT NULL,
      stationId INTEGER NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (lineId, stationId),
      UNIQUE (lineId, position),
      FOREIGN KEY (lineId) REFERENCES line(id),
      FOREIGN KEY (stationId) REFERENCES station(id)
    )
  `);

  await run(`
    CREATE TABLE segment (
      id INTEGER PRIMARY KEY,
      station1Id INTEGER NOT NULL,
      station2Id INTEGER NOT NULL,
      lineId INTEGER NOT NULL,
      CHECK (station1Id <> station2Id),
      FOREIGN KEY (station1Id) REFERENCES station(id),
      FOREIGN KEY (station2Id) REFERENCES station(id),
      FOREIGN KEY (lineId) REFERENCES line(id)
    )
  `);

  await run(`
    CREATE TABLE event (
      id INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      effect INTEGER NOT NULL CHECK (effect >= -4 AND effect <= 4)
    )
  `);

  await run(`
    CREATE TABLE game (
      id INTEGER PRIMARY KEY,
      userId INTEGER NOT NULL,
      startStationId INTEGER NOT NULL,
      destinationStationId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('planning', 'completed')),
      initialCoins INTEGER NOT NULL DEFAULT 20,
      finalScore INTEGER,
      submittedRoute TEXT,
      createdAt TEXT NOT NULL,
      submittedAt TEXT,
      completedAt TEXT,
      FOREIGN KEY (userId) REFERENCES user(id),
      FOREIGN KEY (startStationId) REFERENCES station(id),
      FOREIGN KEY (destinationStationId) REFERENCES station(id)
    )
  `);

  await run(`
    CREATE TABLE game_step (
      id INTEGER PRIMARY KEY,
      gameId INTEGER NOT NULL,
      stepIndex INTEGER NOT NULL,
      fromStationId INTEGER NOT NULL,
      toStationId INTEGER NOT NULL,
      lineId INTEGER NOT NULL,
      eventId INTEGER NOT NULL,
      coinsBefore INTEGER NOT NULL,
      coinsAfter INTEGER NOT NULL,
      FOREIGN KEY (gameId) REFERENCES game(id),
      FOREIGN KEY (fromStationId) REFERENCES station(id),
      FOREIGN KEY (toStationId) REFERENCES station(id),
      FOREIGN KEY (lineId) REFERENCES line(id),
      FOREIGN KEY (eventId) REFERENCES event(id)
    )
  `);
};

const insertSeedData = async () => {
  const stations = [
    [1, "Central Gate", 300, 250],
    [2, "North Park", 300, 120],
    [3, "Museum Hill", 460, 120],
    [4, "River Side", 620, 120],
    [5, "East Market", 760, 250],
    [6, "South Pier", 620, 380],
    [7, "Garden Square", 460, 380],
    [8, "Old Town", 300, 380],
    [9, "West Harbor", 140, 250],
    [10, "Stadium", 140, 120],
    [11, "University", 460, 250],
    [12, "Airport Road", 760, 120],
    [13, "Tech Village", 760, 380],
    [14, "Lake View", 300, 520],
    [15, "Forest End", 460, 520]
  ];

  const lines = [
    [1, "Blue Line", "#0d6efd"],
    [2, "Green Line", "#198754"],
    [3, "Red Line", "#dc3545"],
    [4, "Gold Line", "#ffc107"]
  ];

  const lineStations = [
    [1, 9, 1],
    [1, 1, 2],
    [1, 11, 3],
    [1, 5, 4],
    [1, 12, 5],

    [2, 10, 1],
    [2, 2, 2],
    [2, 1, 3],
    [2, 8, 4],
    [2, 14, 5],
    [2, 15, 6],

    [3, 4, 1],
    [3, 3, 2],
    [3, 11, 3],
    [3, 7, 4],
    [3, 6, 5],
    [3, 13, 6],

    [4, 12, 1],
    [4, 3, 2],
    [4, 1, 3],
    [4, 7, 4],
    [4, 13, 5]
  ];

  const segments = [
    [1, 9, 1, 1],
    [2, 1, 11, 1],
    [3, 11, 5, 1],
    [4, 5, 12, 1],

    [5, 10, 2, 2],
    [6, 2, 1, 2],
    [7, 1, 8, 2],
    [8, 8, 14, 2],
    [9, 14, 15, 2],

    [10, 4, 3, 3],
    [11, 3, 11, 3],
    [12, 11, 7, 3],
    [13, 7, 6, 3],
    [14, 6, 13, 3],

    [15, 12, 3, 4],
    [16, 3, 1, 4],
    [17, 1, 7, 4],
    [18, 7, 13, 4]
  ];

  const events = [
    [1, "Signal shortcut found", 3],
    [2, "Minor platform delay", -2],
    [3, "Passenger bonus collected", 2],
    [4, "Track inspection slowdown", -3],
    [5, "Clear tunnel ahead", 1],
    [6, "Wrong-platform confusion", -1],
    [7, "Express boost", 4],
    [8, "Power fluctuation", -4]
  ];

  await run("BEGIN TRANSACTION");

  try {
    for (const station of stations) {
      await run(
        "INSERT INTO station (id, name, x, y) VALUES (?, ?, ?, ?)",
        station
      );
    }

    for (const line of lines) {
      await run(
        "INSERT INTO line (id, name, color) VALUES (?, ?, ?)",
        line
      );
    }

    for (const lineStation of lineStations) {
      await run(
        "INSERT INTO line_station (lineId, stationId, position) VALUES (?, ?, ?)",
        lineStation
      );
    }

    for (const segment of segments) {
      await run(
        "INSERT INTO segment (id, station1Id, station2Id, lineId) VALUES (?, ?, ?, ?)",
        segment
      );
    }

    for (const event of events) {
      await run(
        "INSERT INTO event (id, description, effect) VALUES (?, ?, ?)",
        event
      );
    }

    await createUser(1, "alice@example.com", "Alice", "password");
    await createUser(2, "bruno@example.com", "Bruno", "password");
    await createUser(3, "clara@example.com", "Clara", "password");

    await run(
      `
      INSERT INTO game
      (id, userId, startStationId, destinationStationId, status, initialCoins, finalScore, submittedRoute, createdAt, submittedAt, completedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        1,
        1,
        9,
        5,
        "completed",
        20,
        24,
        JSON.stringify([1, 2, 3]),
        "2026-05-28T10:00:00.000Z",
        "2026-05-28T10:01:20.000Z",
        "2026-05-28T10:01:35.000Z"
      ]
    );

    await run(
      `
      INSERT INTO game
      (id, userId, startStationId, destinationStationId, status, initialCoins, finalScore, submittedRoute, createdAt, submittedAt, completedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        2,
        2,
        10,
        6,
        "completed",
        20,
        18,
        JSON.stringify([5, 6, 17, 13]),
        "2026-05-29T14:00:00.000Z",
        "2026-05-29T14:01:15.000Z",
        "2026-05-29T14:01:35.000Z"
      ]
    );

    const gameSteps = [
      [1, 1, 1, 9, 1, 1, 1, 20, 23],
      [2, 1, 2, 1, 11, 1, 6, 23, 22],
      [3, 1, 3, 11, 5, 1, 3, 22, 24],

      [4, 2, 1, 10, 2, 2, 2, 20, 18],
      [5, 2, 2, 2, 1, 2, 3, 18, 20],
      [6, 2, 3, 1, 7, 4, 5, 20, 21],
      [7, 2, 4, 7, 6, 3, 4, 21, 18]
    ];

    for (const step of gameSteps) {
      await run(
        `
        INSERT INTO game_step
        (id, gameId, stepIndex, fromStationId, toStationId, lineId, eventId, coinsBefore, coinsAfter)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        step
      );
    }

    await run("COMMIT");
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
};

const verifyDatabase = async () => {
  console.log("\nDatabase verification:");

  const userCount = await get("SELECT COUNT(*) AS count FROM user");
  const stationCount = await get("SELECT COUNT(*) AS count FROM station");
  const lineCount = await get("SELECT COUNT(*) AS count FROM line");
  const eventCount = await get("SELECT COUNT(*) AS count FROM event");
  const gameCount = await get("SELECT COUNT(*) AS count FROM game");

  console.log(`Users: ${userCount.count}`);
  console.log(`Stations: ${stationCount.count}`);
  console.log(`Lines: ${lineCount.count}`);
  console.log(`Events: ${eventCount.count}`);
  console.log(`Seeded games: ${gameCount.count}`);

  const interchangeStations = await all(`
    SELECT s.id, s.name, COUNT(DISTINCT ls.lineId) AS lineCount
    FROM station s
    JOIN line_station ls ON ls.stationId = s.id
    GROUP BY s.id, s.name
    HAVING COUNT(DISTINCT ls.lineId) >= 2
    ORDER BY s.id
  `);

  console.log("\nInterchange stations:");
  console.table(interchangeStations);

  const seededGames = await all(`
    SELECT g.id, u.email, g.status, g.initialCoins, g.finalScore, g.submittedRoute
    FROM game g
    JOIN user u ON u.id = g.userId
    ORDER BY g.id
  `);

  console.log("\nSeeded successful games:");
  console.table(seededGames);

  const passwordCheck = await all(`
    SELECT id, email, LENGTH(password) AS passwordLength, LENGTH(salt) AS saltLength
    FROM user
    ORDER BY id
  `);

  console.log("\nPassword storage check:");
  console.table(passwordCheck);
};

try {
  await createTables();
  await insertSeedData();
  await verifyDatabase();

  console.log("\nlast-race.sqlite created and seeded successfully.");
  console.log("\nSeeded credentials for README:");
  console.log("alice@example.com / password");
  console.log("bruno@example.com / password");
  console.log("clara@example.com / password");
} catch (err) {
  console.error("Error while creating database:");
  console.error(err);
} finally {
  db.close();
}