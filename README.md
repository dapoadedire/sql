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