[Notes and code](https://sql.holt.courses/)

[Course Repo](http://github.com/btholt/complete-intro-to-sql)

```
docker run -e POSTGRES_PASSWORD=lol --name=pg --rm -d -p 5432:5432 postgres:14
```

```

docker exec -u postgres -it pg psql


```

- We gave it a password of "lol" (feel free to change it to something different, I just remember lol because lol)
- We ran it with a name of pg so we can refer it with that shorthand
- We used the --rm flag so the container deletes itself afterwards (rather than leave its logs and such around)
- We ran it in the background with -d. Otherwise it'll start in the foreground.
- The -p allows us to expose port 5432 locally which is the port Postgres runs on by default.
- Run docker ps to see it running. You can also see it in the Docker Desktop app running under the containers tab.

## Basic `psql` Commands

## Connecting to a Database

- `\c <database_name>`: Connect to a specific database.
- `\l`: List all databases.
- `\conninfo`: Show current connection details.

## Database Operations

- `\dt`: List tables in the current database.
- `\d <table_name>`: Describe a table's structure (columns, types, etc.).
- `\dn`: List all schemas in the database.
- `\du`: List all users/roles.

## Query Execution

- `\i <file_path>`: Execute SQL commands from a file.
- `\e`: Open the query buffer in a text editor.
- `\g`: Re-execute the last query.
- `\timing`: Toggle query execution time measurement.

## Table Operations

- `\dt+`: List tables with additional details (e.g., size).
- `\x auto`: Toggle expanded output mode for better readability of wide tables.
- `\d+ <table_name>`: Show detailed table info (e.g., storage, indexes).

## Data Export/Import

- `\copy <table> TO <file_path>`: Export data to a file (client-side).
- `\copy <table> FROM <file_path>`: Import data from a file (client-side).

## Metadata and Debugging

- `\dv`: List views.
- `\di`: List indexes.
- `\df`: List functions.
- `\watch <seconds>`: Repeatedly execute a query at intervals (e.g., `SELECT NOW(); \watch 5`).

## Help Commands

- `\?`: Show all `psql` meta-commands.
- `\h`: List all SQL commands.
- `\h <command>`: Get help for a specific SQL command (e.g., `\h SELECT`).

## Exiting

- `\q`: Quit the `psql` session.

```
SELECT id, title, image
FROM ingredients
LIMIT 5;
```

```
SELECT id, title, image
FROM ingredients
LIMIT 5;
OFFSET 5;

```

```

SELECT *
FROM ingredients
WHERE id <= 10
  OR id >= 20;

```

```
SELECT * FROM ingredients ORDER BY id DESC;


```

```

SELECT * FROM ingredients WHERE title LIKE '%pota%';
```

```
SELECT * FROM ingredients WHERE CONCAT(title, type) LIKE '%fruit%';
```

```
SELECT * FROM ingredients WHERE LOWER(CONCAT(title, type)) LIKE LOWER('%FrUiT%');

```

### better way, with ILIKE. same as above but case insensitive.

```
SELECT * FROM ingredients WHERE CONCAT(title, type) ILIKE '%FrUiT%';


```

```
SELECT * FROM ingredients WHERE title ILIKE 'c%';

```

```
1; DROP TABLE ingredients; -- this will delete the table
```

## Relationships

```
CREATE TABLE recipes (
  recipe_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR ( 255 ) UNIQUE NOT NULL,
  body TEXT
);
```

```
INSERT INTO recipes
  (title, body)
VALUES
  ('cookies', 'very yummy'),
  ('empanada','ugh so good');
```

Another table:

```
CREATE TABLE recipes_photos (
  photo_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  recipe_id INTEGER,
  url VARCHAR(255) NOT NULL
);
```

```
INSERT INTO recipes_photos
  (recipe_id, url)
VALUES
  (1, 'cookies1.jpg'),
  (1, 'cookies2.jpg'),
  (1, 'cookies5.jpg'),
  (2, 'empanada1.jpg'),
  (2, 'empanada2.jpg');
```

```
SELECT title, body FROM recipes WHERE recipe_id = 4;
SELECT url FROM recipes_photos WHERE recipe_id = 4;
```

Now, doing it with a join:

this is a join.
inner join is the most common type of join. it only returns rows that have matching values in both tables.
so it won't return any recipes that don't have photos.

```
SELECT recipes.title, recipes.body, recipes_photos.url
  FROM recipes_photos
  INNER JOIN
    recipes
  ON
    recipes_photos.recipe_id = recipes.recipe_id
```

this is a left join. it returns all rows from the left table (recipes_photos) and the matched rows from the right table (recipes). if there is no match, NULL values are returned for columns from the right table.

```
SELECT recipes.title, recipes.body, recipes_photos.url
  FROM recipes_photos
  LEFT JOIN
    recipes
  ON
    recipes_photos.recipe_id = recipes.recipe_id
```

this is a right join. it returns all rows from the right table (recipes) and the matched rows from the left table (recipes_photos). if there is no match, NULL values are returned for columns from the left table.

```
SELECT recipes.title, recipes.body, recipes_photos.url
  FROM recipes_photos
  RIGHT JOIN
    recipes
  ON
    recipes_photos.recipe_id = recipes.recipe_id
```

There's also natural joins, cross joins, and self joins. But those are less common.

## Foreign Keys and Managing References

```
DELETE FROM recipes WHERE recipe_id = 5;
```

Check the photos, it's still there.

```
SELECT * FROM recipes_photos WHERE recipe_id = 5;
```

This is bad, we don't want orphaned records. We want to delete the photos too.

```

So, let's drop the table and recreate it with a foreign key constraint.

```

DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS recipes_photos;
CREATE TABLE recipes (
recipe_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
title VARCHAR ( 255 ) UNIQUE NOT NULL,
body TEXT
);
INSERT INTO recipes
(title, body)
VALUES
('cookies', 'very yummy'),
('empanada','ugh so good'),
('jollof rice', 'spectacular'),
('shakshuka','absolutely wonderful'),
('khachapuri', 'breakfast perfection'),
('xiao long bao', 'god I want some dumplings right now');

```

```
CREATE TABLE recipes_photos (
  photo_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  recipe_id INTEGER REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  url VARCHAR(255) NOT NULL
);
```

Okay, so we have a few things here

The REFERENCES portion means it's going to be a foreign key. You tell it what it's going to match up to. In our case recipes is the table and recipe_id is the name of the column it'll match. In our case those are the same name, but it doesn't have to be. It must be the primary key of the other table.
Then you need to tell it what to do when you delete something. With ON DELETE CASCADE you say "if the row in the other table gets deleted, delete this one too." So if we delete something from recipes, it will automatically delete all its photos. Pretty cool, right?
You can also do ON DELETE SET NULL which does exactly what it says it does. There's also ON DELETE NO ACTION which will error out if you try to delete something from recipes if there are still photos left. This forces developers to clean up photos before deleting recipes. That can be helpful to.
There's also ON UPDATEs if you need to handle some synced state state between the two tables.
If you're going to have have two tables reference each other, use foreign keys where possible. It makes useful constraints to make sure delete and update behaviors are intentional and it makes the queries faster.



```

INSERT INTO recipes_photos
  (recipe_id, url)
VALUES
  (1, 'cookies1.jpg'),
  (1, 'cookies2.jpg'),
  (1, 'cookies3.jpg'),
  (1, 'cookies4.jpg'),
  (1, 'cookies5.jpg'),
  (2, 'empanada1.jpg'),
  (2, 'empanada2.jpg'),
  (3, 'jollof1.jpg'),
  (4, 'shakshuka1.jpg'),
  (4, 'shakshuka2.jpg'),
  (4, 'shakshuka3.jpg'),
  (5, 'khachapuri1.jpg'),
  (5, 'khachapuri2.jpg');
```

Now let's see what happens when we delete a recipe.

```
SELECT * FROM recipes_photos WHERE recipe_id = 5;
DELETE FROM recipes WHERE recipe_id = 5;
SELECT * FROM recipes_photos WHERE recipe_id = 5;
```

### Many to many

```
CREATE TABLE recipe_ingredients (
recipe_id INT REFERENCES recipes(recipe_id) ON DELETE NO ACTION,
ingredient_id INT REFERENCES ingredients(id) ON DELETE NO ACTION,
CONSTRAINT recipe_ingredients_pk PRIMARY KEY (recipe_id, ingredient_id)
);

```


```
INSERT INTO recipe_ingredients
  (recipe_id, ingredient_id)
VALUES
  (1, 10),
  (1, 11),
  (1, 13),
  (2, 5),
  (2, 13);
```


```
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
WHERE
  ri.recipe_id = 1;

```

```
SELECT
  i.title AS ingredient_title,
  i.image AS ingredient_image,
  i.type AS ingredient_type,
  r.title AS recipe_title,
  r.body AS recipe_body,
  r.recipe_id AS rid,
  i.id AS iid
FROM
  recipe_ingredients ri
INNER JOIN
  ingredients i
ON
  i.id = ri.ingredient_id
INNER JOIN
  recipes r
ON
  r.recipe_id = ri.recipe_id;

```