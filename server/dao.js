import sqlite from "sqlite3";

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