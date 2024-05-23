const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Home API
app.get("/", (req, res) => {
  res.send("Hi Darling....!");
});

//Convert Movies DB
const convertMoviesDB = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//GET Movies API 1
app.get("/movies/", async (req, res) => {
  const moviesQuery = `
    SELECT
        *
    FROM
        movie;
    `;

  const moviesData = await db.all(moviesQuery);
  res.send(moviesData.map((eachMovie) => convertMoviesDB(eachMovie)));
});

//POST Movies API 2
app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const postMovieQuery = `
    INSERT INTO 
        movie(
            director_id,
            movie_name,
            lead_actor
        )
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
    `;

  await db.run(postMovieQuery);
  res.send("Movie Successfully Added");
});

//Convert MovieDB into Response Object
const convertMovieDBIntoResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// GET Movie API 3
app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `
    SELECT 
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};
    `;

  const movie = await db.get(getMovieQuery);
  res.send(convertMovieDBIntoResponseObject(movie));
});

//PUT Movie API 4
app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const updateMovieQuery = `
    UPDATE 
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
    `;

  await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

//DELETE Movie API 5
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `
    DELETE
    FROM
        movie
    WHERE
        movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

// Convert DirectorsDB into Response Object
const convertDirectorDBIntoResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET Directors API 6
app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
    SELECT
        *
    FROM
        director;
    `;

  const directors = await db.all(getDirectorsQuery);
  res.send(
    directors.map((eachDirector) =>
      convertDirectorDBIntoResponseObject(eachDirector)
    )
  );
});

//Convert Director Movies DB
const convertDirectorMoviesDB = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//GET Director API 7
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getDirectorMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie 
    WHERE
        director_id = ${directorId};
    `;

  const directorMovies = await db.all(getDirectorMoviesQuery);
  res.send(
    directorMovies.map((eachMovie) => convertDirectorMoviesDB(eachMovie))
  );
});

module.exports = app;
