const path = require("path");
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
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

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg
  try {
   
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (r.recipe_id)
        r.recipe_id, r.title, COALESCE(rp.url, 'default.jpg') AS url
      FROM
        recipes r
      LEFT JOIN
        recipes_photos rp
      ON
        r.recipe_id = rp.recipe_id;
    `);

    res.status(200).json({ rows }).end();
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }

  res.status(501).json({ status: "not implemented", rows: [] });
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  //
  //
  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  //
  //
  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg
  try {
    // const { rows } = await pool.query(
    //   `
    //   SELECT r.title, r.body, COALESCE(p.url, 'default.jpg') AS photo_url,
    //         i.image AS ingredient_image,
    //          i.type AS ingredient_type, i.title AS ingredient_title
    //   FROM recipes r
    //   LEFT JOIN recipes_photos p ON r.recipe_id = p.recipe_id
    //   LEFT JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
    //   LEFT JOIN ingredients i ON i.id = ri.ingredient_id
    //   WHERE r.recipe_id = $1`,
    //   [recipeId]
    // );

    const ingredientsPromise = pool.query(
      `
      SELECT 
        i.title AS ingredient_title,
        i.image AS ingredient_image,
        i.type AS ingredient_type
      FROM
        recipe_ingredients ri 
      INNER JOIN 
        ingredients i 
      ON 
        i.id = ri.ingredient_id
      WHERE ri.recipe_id = $1`,
      [recipeId]
    );

    const photosPromise = pool.query(
      `
      SELECT
        r.title, r.body, COALESCE(rp.url, 'default.jpg') AS url
      FROM
        recipes r
      LEFT JOIN
        recipes_photos rp
      ON
        rp.recipe_id = r.recipe_id
      WHERE r.recipe_id = $1`,
      [recipeId]
    );

    const [photosResponse, ingredientsResponse] = await Promise.all([
      photosPromise,
      ingredientsPromise,
    ]);

    const photosRows = photosResponse.rows;
    const ingredientsRows = ingredientsResponse.rows;

    const photos = [];
    for (let i = 0; i < photosRows.length; i++) {
      const photo = photosRows[i];
      photos.push(photo.url);
    }

    res.status(200).json({
      ingredients: ingredientsRows,
      photos: photos,
      title: photosRows[0].title,
      body: photosRows[0].body,
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});
/**
 * Student code ends here
 */

module.exports = router;
