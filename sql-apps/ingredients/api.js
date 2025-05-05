const path = require("path");
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

// connect to postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});
router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);

  try {
    const { rows } = await pool.query(
      "SELECT * FROM ingredients WHERE type = $1",
      [type]
    );
    res.status(200).json({ status: "ok", rows });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});


router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);

  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time

  try {
    let whereClause;``
    const params = [page * 5];
    if (term) {
      whereClause = "WHERE CONCAT(title, type) ILIKE $2";
      params.push(`%${term}%`);
    }
    // const { rows, rowCount } = await pool.query(
    //   `SELECT * FROM ingredients ${whereClause} OFFSET $1 LIMIT 5`,
    //   params
    // );

    const { rows } = await pool.query(
      `SELECT *, COUNT(*) OVER ()::INT AS total_count FROM ingredients
       ${whereClause} OFFSET $1 LIMIT 5`,
      params
    );
    res.status(200).json({ status: "ok", rows });
  }
  catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
}
);


/**
 * Student code ends here
 */

module.exports = router;
