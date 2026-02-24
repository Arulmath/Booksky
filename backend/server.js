const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// -------- SERVE FRONTEND --------
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "Home.html"));
});

// -------- MYSQL CONNECTION (Railway) --------
const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to Railway MySQL");
});

// -------- BOOKS PER CATEGORY --------
app.get("/books-category", (req, res) => {
  const sql = `
    SELECT c.category_name, COUNT(b.book_id) AS total
    FROM categories c
    LEFT JOIN books b ON c.category_id = b.category_id
    GROUP BY c.category_name
  `;

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// -------- TOTAL BOOKS --------
app.get("/total-books", (req, res) => {
  connection.query(
    "SELECT COUNT(*) AS total FROM books",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// -------- BOOKS PER AUTHOR --------
app.get("/books-author", (req, res) => {
  const sql = `
    SELECT a.author_name, COUNT(b.book_id) AS total
    FROM authors a
    JOIN books b ON a.author_id = b.author_id
    GROUP BY a.author_name
  `;

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// -------- GET ALL BOOKS --------
app.get("/books", (req, res) => {
  const sql = `
    SELECT b.book_id, b.title, b.description, b.price,
           a.author_name,
           c.category_name
    FROM books b
    JOIN authors a ON b.author_id = a.author_id
    JOIN categories c ON b.category_id = c.category_id
    ORDER BY c.category_name, b.created_at DESC
  `;

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// -------- TODAY BOOKS --------
app.get("/today-books", (req, res) => {
  const sql = `
    SELECT b.book_id, b.title, b.description, b.price,
           a.author_name,
           c.category_name
    FROM books b
    JOIN authors a ON b.author_id = a.author_id
    JOIN categories c ON b.category_id = c.category_id
    WHERE DATE(b.created_at) = CURDATE()
    ORDER BY b.created_at DESC
  `;

  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// -------- ADD BOOK --------
app.post("/add-book", (req, res) => {
  const { title, description, price, author, category_id } = req.body;

  connection.query(
    "SELECT author_id FROM authors WHERE author_name = ?",
    [author],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        insertBook(result[0].author_id);
      } else {
        connection.query(
          "INSERT INTO authors (author_name) VALUES (?)",
          [author],
          (err, result2) => {
            if (err) return res.status(500).json(err);
            insertBook(result2.insertId);
          }
        );
      }

      function insertBook(authorId) {
        connection.query(
          "INSERT INTO books (title, description, price, author_id, category_id) VALUES (?, ?, ?, ?, ?)",
          [title, description, price, authorId, category_id],
          (err) => {
            if (err) return res.status(500).json(err);
            res.send("Book Added");
          }
        );
      }
    }
  );
});

// -------- DELETE BOOK --------
app.delete("/delete-book/:id", (req, res) => {
  connection.query(
    "DELETE FROM books WHERE book_id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.send("Deleted");
    }
  );
});

// -------- START SERVER --------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
