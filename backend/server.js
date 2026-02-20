const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "booksky"
});

db.connect(err => {
    if (err) console.log(err);
    else console.log("MySQL Connected");
});

// -------- BOOKS PER CATEGORY --------
app.get("/books-category", (req, res) => {

    const sql = `
    SELECT c.category_name, COUNT(b.book_id) AS total
    FROM categories c
    LEFT JOIN books b ON c.category_id = b.category_id
    GROUP BY c.category_name
    `;

    db.query(sql, (err, result) => {
        if (err) console.log(err);
        res.json(result);
    });
});



// -------- TOTAL BOOKS --------
app.get("/total-books", (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM books",
    (err, result) => {
        res.json(result);
    });
});


// -------- BOOKS PER AUTHOR --------
app.get("/books-author", (req, res) => {
    const sql = `
    SELECT a.author_name, COUNT(b.book_id) AS total
    FROM authors a
    JOIN books b ON a.author_id = b.author_id
    GROUP BY a.author_name
    `;
    db.query(sql, (err, result) => {
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
    ORDER BY c.category_name, b.created_at DESC;
    `;

    db.query(sql, (err, result) => {
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
    db.query(sql, (err, result) => {
        res.json(result);
    });
});


// -------- ADD BOOK --------
app.post("/add-book", (req, res) => {

    const { title, description, price, author, category_id } = req.body;

    db.query("SELECT author_id FROM authors WHERE author_name = ?",
    [author], (err, result) => {

        if (result.length > 0) {
            insertBook(result[0].author_id);
        } else {
            db.query("INSERT INTO authors (author_name) VALUES (?)",
            [author], (err, result2) => {
                insertBook(result2.insertId);
            });
        }

        function insertBook(authorId) {
            db.query(
                "INSERT INTO books (title, description, price, author_id, category_id) VALUES (?, ?, ?, ?, ?)",
                [title, description, price, authorId, category_id],
                () => res.send("Book Added")
            );
        }
    });
});


// -------- DELETE --------
app.delete("/delete-book/:id", (req, res) => {
    db.query("DELETE FROM books WHERE book_id = ?",
    [req.params.id],
    () => res.send("Deleted"));
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

