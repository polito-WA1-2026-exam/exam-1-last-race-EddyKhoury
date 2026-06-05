import sqlite from "sqlite3";
import crypto from "crypto";

const db = new sqlite.Database("last-race.sqlite", (err) => {
  if (err) {
    throw err;
  }
});

/**
 * SELECT query that returns one row.
 */
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

/**
 * SELECT query that returns many rows.
 */
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

/**
 * INSERT / UPDATE / DELETE query.
 * We prepare it now because later sections will need it.
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes,
        });
      }
    });
  });
};

const getAllStations = () => {
  return all(
    `SELECT id, name, x, y
     FROM station
     ORDER BY id`
  );
};

const getAllLines = () => {
  return all(
    `SELECT id, name, color
     FROM line
     ORDER BY id`
  );
};

const getAllSegments = () => {
  return all(
    `SELECT id, station1Id, station2Id, lineId
     FROM segment
     ORDER BY id`
  );
};

const getAllEvents = () => {
  return all(
    `SELECT id, description, effect
     FROM event
     ORDER BY id`
  );
};

const getUserById = (id) => {
  return get(
    `SELECT id, email, name
     FROM user
     WHERE id = ?`,
    [id]
  );
};
export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM user WHERE email = ?";

    db.get(sql, [email], (err, user) => {
      if (err) {
        reject(err);
      } else if (user === undefined) {
        resolve(false);
      } else {
        crypto.scrypt(password, user.salt, 32, (err, hashedPassword) => {
          if (err) {
            return reject(err);
          }

          const storedPassword = Buffer.from(user.password, "hex");

          if (
            storedPassword.length === hashedPassword.length &&
            crypto.timingSafeEqual(storedPassword, hashedPassword)
          ) {
            resolve({
              id: user.id,
              email: user.email,
              name: user.name,
            });
          } else {
            resolve(false);
          }
        });
      }
    });
  });
};
export {
  get,
  all,
  run,
  getAllStations,
  getAllLines,
  getAllSegments,
  getAllEvents,
  getUserById,
};

// SECTION 5 - Full network, planning network, game creation, and ranking

export const getFullNetwork = async () => {
  const stations = await all(
    `SELECT id, name, x, y
     FROM station
     ORDER BY id`
  );

  const lines = await all(
    `SELECT id, name, color
     FROM line
     ORDER BY id`
  );

  const lineStations = await all(
    `SELECT lineId, stationId, position
     FROM line_station
     ORDER BY lineId, position`
  );

  const segments = await all(
    `SELECT s.id, s.station1Id, s.station2Id, s.lineId,
            l.name AS lineName, l.color AS lineColor
     FROM segment s
     JOIN line l ON s.lineId = l.id
     ORDER BY s.id`
  );

  return {
    stations,
    lines,
    lineStations,
    segments,
  };
};

export const getStationLines = async (stationId) => {
  return await all(
    `SELECT lineId
     FROM line_station
     WHERE stationId = ?
     ORDER BY lineId`,
    [stationId]
  );
};

export const isInterchangeStation = async (stationId) => {
  const stationLines = await getStationLines(stationId);
  return stationLines.length >= 2;
};

export const computeShortestDistance = async (startStationId, destinationStationId) => {
  if (startStationId === destinationStationId) {
    return 0;
  }

  const segments = await all(
    `SELECT station1Id, station2Id
     FROM segment`
  );

  const graph = new Map();

  for (const segment of segments) {
    if (!graph.has(segment.station1Id)) {
      graph.set(segment.station1Id, []);
    }

    if (!graph.has(segment.station2Id)) {
      graph.set(segment.station2Id, []);
    }

    graph.get(segment.station1Id).push(segment.station2Id);
    graph.get(segment.station2Id).push(segment.station1Id);
  }

  const visited = new Set();
  const queue = [{ stationId: startStationId, distance: 0 }];

  visited.add(startStationId);

  while (queue.length > 0) {
    const current = queue.shift();

    const neighbors = graph.get(current.stationId) || [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }

      if (neighbor === destinationStationId) {
        return current.distance + 1;
      }

      visited.add(neighbor);
      queue.push({
        stationId: neighbor,
        distance: current.distance + 1,
      });
    }
  }

  return null;
};

export const chooseRandomStartDestination = async () => {
  const stations = await all(
    `SELECT id
     FROM station
     ORDER BY id`
  );

  const possiblePairs = [];

  for (const start of stations) {
    for (const destination of stations) {
      if (start.id === destination.id) {
        continue;
      }

      const distance = await computeShortestDistance(start.id, destination.id);

      // Final specification: distance is counted as number of segments/edges.
      // Example: A -> B -> C -> D has distance 3.
      if (distance !== null && distance >= 3) {
        possiblePairs.push({
          startStationId: start.id,
          destinationStationId: destination.id,
          shortestDistance: distance,
        });
      }
    }
  }

  if (possiblePairs.length === 0) {
    throw new Error("No valid start/destination pair found");
  }

  const randomIndex = Math.floor(Math.random() * possiblePairs.length);
  return possiblePairs[randomIndex];
};

export const createGame = async (userId) => {
  const pair = await chooseRandomStartDestination();

  const result = await run(
    `INSERT INTO game(
       userId,
       startStationId,
       destinationStationId,
       status,
       initialCoins,
       finalScore,
       submittedRoute,
       createdAt,
       submittedAt,
       completedAt
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
    [
      userId,
      pair.startStationId,
      pair.destinationStationId,
      "planning",
      20,
      null,
      null,
      null,
      null,
    ]
  );

  return await getGameById(result.id, userId);
};

export const getGameById = async (gameId, userId) => {
  return await get(
    `SELECT g.id,
            g.userId,
            g.startStationId,
            start.name AS startStationName,
            g.destinationStationId,
            destination.name AS destinationStationName,
            g.status,
            g.initialCoins,
            g.finalScore,
            g.createdAt,
            g.submittedAt,
            g.completedAt
     FROM game g
     JOIN station start ON g.startStationId = start.id
     JOIN station destination ON g.destinationStationId = destination.id
     WHERE g.id = ? AND g.userId = ?`,
    [gameId, userId]
  );
};

export const getPlanningNetwork = async (gameId, userId) => {
  const game = await getGameById(gameId, userId);

  if (!game) {
    return null;
  }

  const stations = await all(
    `SELECT id, name, x, y
     FROM station
     ORDER BY id`
  );

  const segments = await all(
    `SELECT id, station1Id, station2Id
     FROM segment
     ORDER BY id`
  );

  return {
    game,
    stations,
    segments,
  };
};

export const getRanking = async () => {
  return await all(
    `SELECT u.id AS userId,
            u.name,
            u.email,
            MAX(g.finalScore) AS bestScore
     FROM user u
     JOIN game g ON u.id = g.userId
     WHERE g.status = 'completed'
       AND g.finalScore IS NOT NULL
     GROUP BY u.id, u.name, u.email
     ORDER BY bestScore DESC, u.name ASC`
  );
};

// ===============================
// Section 6 - Route validation and execution
// ===============================

async function getSegmentById(segmentId) {
  return get(
    `SELECT id, station1Id, station2Id, lineId
     FROM segment
     WHERE id = ?`,
    [segmentId]
  );
}

async function getRandomEvent() {
  return get(
    `SELECT id, description, effect
     FROM event
     ORDER BY RANDOM()
     LIMIT 1`
  );
}

export async function validateRoute(game, segmentIds) {
  if (!Array.isArray(segmentIds)) {
    return {
      valid: false,
      reason: "Submitted route must be an array of segment IDs",
      steps: []
    };
  }

  if (segmentIds.length === 0) {
    return {
      valid: false,
      reason: "Route is empty",
      steps: []
    };
  }

  for (const segmentId of segmentIds) {
    if (!Number.isInteger(segmentId) || segmentId <= 0) {
      return {
        valid: false,
        reason: "All submitted segment IDs must be positive integers",
        steps: []
      };
    }
  }

  let currentStationId = game.startStationId;
  let currentLineId = null;
  const reconstructedSteps = [];

  for (let i = 0; i < segmentIds.length; i++) {
    const segmentId = segmentIds[i];
    const segment = await getSegmentById(segmentId);

    if (!segment) {
      return {
        valid: false,
        reason: `Segment ${segmentId} does not exist`,
        steps: []
      };
    }

    const touchesCurrentStation =
      segment.station1Id === currentStationId ||
      segment.station2Id === currentStationId;

    if (!touchesCurrentStation) {
      return {
        valid: false,
        reason: `Segment ${segmentId} is not connected to the current station`,
        steps: []
      };
    }

    if (currentLineId === null) {
      currentLineId = segment.lineId;
    } else if (segment.lineId !== currentLineId) {
      const canChangeLine = await isInterchangeStation(currentStationId);

      if (!canChangeLine) {
        return {
          valid: false,
          reason: "Line change attempted at a non-interchange station",
          steps: []
        };
      }

      currentLineId = segment.lineId;
    }

    const nextStationId =
      segment.station1Id === currentStationId
        ? segment.station2Id
        : segment.station1Id;

    reconstructedSteps.push({
      stepIndex: i + 1,
      segmentId: segment.id,
      fromStationId: currentStationId,
      toStationId: nextStationId,
      lineId: segment.lineId
    });

    currentStationId = nextStationId;
  }

  if (currentStationId !== game.destinationStationId) {
    return {
      valid: false,
      reason: "Route does not reach the assigned destination station",
      steps: []
    };
  }

  return {
    valid: true,
    reason: "Route is valid",
    steps: reconstructedSteps
  };
}

export async function executeValidRoute(gameId, reconstructedSteps) {
  let coins = 20;
  const executedSteps = [];

  for (const step of reconstructedSteps) {
    const event = await getRandomEvent();

    const coinsBefore = coins;
    coins = coins + event.effect;
    const coinsAfter = coins;

    await run(
      `INSERT INTO game_step(
        gameId,
        stepIndex,
        fromStationId,
        toStationId,
        lineId,
        eventId,
        coinsBefore,
        coinsAfter
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gameId,
        step.stepIndex,
        step.fromStationId,
        step.toStationId,
        step.lineId,
        event.id,
        coinsBefore,
        coinsAfter
      ]
    );

    executedSteps.push({
      ...step,
      eventId: event.id,
      eventDescription: event.description,
      eventEffect: event.effect,
      coinsBefore,
      coinsAfter
    });
  }

  return {
    finalCoins: coins,
    finalScore: Math.max(0, coins),
    steps: executedSteps
  };
}

export async function submitRoute(gameId, userId, segmentIds) {
  const game = await getGameById(gameId, userId);

  if (!game) {
    return null;
  }

  if (game.status !== "planning") {
    const error = new Error("Game is not in planning state");
    error.code = "GAME_NOT_SUBMITTABLE";
    throw error;
  }

  const submittedRoute = JSON.stringify(segmentIds);
  const validation = await validateRoute(game, segmentIds);

  await run("BEGIN TRANSACTION");

  try {
    await run(
      `DELETE FROM game_step
       WHERE gameId = ?`,
      [gameId]
    );

    if (!validation.valid) {
      await run(
        `UPDATE game
         SET status = 'completed',
             finalScore = 0,
             submittedRoute = ?,
             submittedAt = datetime('now'),
             completedAt = datetime('now')
         WHERE id = ?
           AND userId = ?`,
        [submittedRoute, gameId, userId]
      );

      await run("COMMIT");

      return {
        valid: false,
        reason: validation.reason,
        finalScore: 0,
        stepCount: 0
      };
    }

    const execution = await executeValidRoute(gameId, validation.steps);

    await run(
      `UPDATE game
       SET status = 'completed',
           finalScore = ?,
           submittedRoute = ?,
           submittedAt = datetime('now'),
           completedAt = datetime('now')
       WHERE id = ?
         AND userId = ?`,
      [execution.finalScore, submittedRoute, gameId, userId]
    );

    await run("COMMIT");

    return {
      valid: true,
      reason: validation.reason,
      finalScore: execution.finalScore,
      finalCoins: execution.finalCoins,
      stepCount: execution.steps.length
    };
  } catch (err) {
    await run("ROLLBACK");
    throw err;
  }
}

export async function getGameSteps(gameId, userId) {
  return all(
    `SELECT
       gs.id,
       gs.gameId,
       gs.stepIndex,
       gs.fromStationId,
       fs.name AS fromStationName,
       gs.toStationId,
       ts.name AS toStationName,
       gs.lineId,
       l.name AS lineName,
       l.color AS lineColor,
       gs.eventId,
       e.description AS eventDescription,
       e.effect AS eventEffect,
       gs.coinsBefore,
       gs.coinsAfter
     FROM game_step gs
     JOIN game g ON gs.gameId = g.id
     JOIN station fs ON gs.fromStationId = fs.id
     JOIN station ts ON gs.toStationId = ts.id
     JOIN line l ON gs.lineId = l.id
     JOIN event e ON gs.eventId = e.id
     WHERE gs.gameId = ?
       AND g.userId = ?
     ORDER BY gs.stepIndex`,
    [gameId, userId]
  );
}