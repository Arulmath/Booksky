document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".container");
    const popupOverlay = document.querySelector(".popup-overlay");
    const popupBox = document.querySelector(".popup-box");
    const addPopupButton = document.getElementById("add-popup");
    const cancelButton = document.getElementById("cancel-popup");
    const addBookButton = document.getElementById("add-book");

    const path = window.location.pathname;

    // ================= PAGE DETECTION =================
    if (path.includes("Home.html")) {
        loadHomeData();
    }
    else if (path.includes("Analytics.html")) {
        loadAllBooks();
    }
    else if (path.includes("Book.html")) {
        loadTodayBooks();
    }


    // ================= HOME PAGE =================
    function loadHomeData() {

        fetch("http://localhost:3000/total-books")
        .then(res => res.json())
        .then(data => {
            const totalElement = document.getElementById("total-books");
            if (totalElement)
                totalElement.innerText = data[0].total;
        });

        fetch("http://localhost:3000/books-author")
        .then(res => res.json())
        .then(data => {
            const div = document.getElementById("books-author");
            if (!div) return;

            div.innerHTML = "";
            data.forEach(item => {
                div.innerHTML += `<p>${item.author_name} - ${item.total}</p>`;
            });
        });
         // Books Per Category  
    fetch("http://localhost:3000/books-category")
    .then(res => res.json())
    .then(data => {

        const containerDiv = document.createElement("div");
        containerDiv.classList.add("book-container");

        containerDiv.innerHTML = `<h2>Books Per Category</h2>`;

        data.forEach(item => {
            containerDiv.innerHTML += `<p>${item.category_name} - ${item.total}</p>`;
        });

        document.querySelector(".container").appendChild(containerDiv);
    });
    }


    // ================= ANALYTICS =================
function loadAllBooks() {

    fetch("http://localhost:3000/books")
    .then(res => res.json())
    .then(data => {

        if (!container) return;

        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<h3>No Books Found</h3>";
            return;
        }

        const grouped = {};

        data.forEach(book => {
            if (!grouped[book.category_name]) {
                grouped[book.category_name] = [];
            }
            grouped[book.category_name].push(book);
        });

        for (let category in grouped) {

            // Category Title
            const categoryTitle = document.createElement("h2");
            categoryTitle.style.color = "#ff4d4d";
            categoryTitle.style.marginTop = "30px";
            categoryTitle.innerText = "Category: " + category;

            container.appendChild(categoryTitle);

            // Book Wrapper
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.flexWrap = "wrap";
            wrapper.style.gap = "20px";

            grouped[category].forEach(book => {

                const div = document.createElement("div");
                div.classList.add("book-container");

                div.innerHTML = `
                    <h3>${book.title}</h3>
                    <h4>${book.author_name}</h4>
                    <p><b>Price:</b> ₹${book.price}</p>
                    <p>${book.description}</p>
                    <button onclick="deleteBook(${book.book_id})">Delete</button>
                `;

                wrapper.appendChild(div);
            });

            container.appendChild(wrapper);
        }

    });
}



    // ================= BOOKSKY =================
    function loadTodayBooks() {
        fetch("http://localhost:3000/today-books")
        .then(res => res.json())
        .then(displayBooks);
    }


    // ================= DISPLAY FUNCTION =================
    function displayBooks(data) {

        if (!container) return;

        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<h3>No Books Found</h3>";
            return;
        }

        data.forEach(book => {

            const div = document.createElement("div");
            div.classList.add("book-container");

            div.innerHTML = `
                <h2>${book.title}</h2>
                <h4>${book.author_name}</h4>
                <p><b>Category:</b> ${book.category_name}</p>
                <p><b>Price:</b> ₹${book.price}</p>
                <p>${book.description}</p>
                <button onclick="deleteBook(${book.book_id})">Delete</button>
            `;

            container.appendChild(div);
        });
    }


    // ================= ADD BOOK =================
    if (addBookButton) {
        addBookButton.addEventListener("click", (event) => {

            event.preventDefault();

            const title = document.getElementById("book-title").value;
            const author = document.getElementById("book-author").value;
            const price = document.getElementById("book-price").value;
            const category_id = document.getElementById("book-category").value;
            const description = document.getElementById("book-description").value;

            fetch("http://localhost:3000/add-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    author,
                    category_id
                })
            })
            .then(res => res.text())
            .then(() => {

                if (popupOverlay) popupOverlay.style.display = "none";
                if (popupBox) popupBox.style.display = "none";

                if (path.includes("Book.html")) {
                    loadTodayBooks();
                } else if (path.includes("Analytics.html")) {
                    loadAllBooks();
                }
            });
        });
    }


    // ================= DELETE =================
    window.deleteBook = function(id) {

        fetch(`http://localhost:3000/delete-book/${id}`, {
            method: "DELETE"
        })
        .then(res => res.text())
        .then(() => {

            if (path.includes("Book.html")) {
                loadTodayBooks();
            } else if (path.includes("Analytics.html")) {
                loadAllBooks();
            }
        });
    };

});


// ================= NAVIGATION FUNCTIONS =================
function goMain() {
    window.location.href = "Book.html";
}

function goHome() {
    window.location.href = "Home.html";
}

function goAnalytics() {
    window.location.href = "Analytics.html";
}
