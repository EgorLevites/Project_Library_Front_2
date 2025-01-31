const apiUrl = 'https://project-library-czbz.onrender.com';

// Elements
const authContent = document.getElementById('auth-content');
const formContent = document.getElementById('form-content');
const bookContent = document.getElementById('book-content');
const carouselContainer = document.getElementById('carousel-container');
const userProfile = document.getElementById('user-profile');
const userModal = document.getElementById('userModal');
const userModalBody = document.getElementById('user-modal-body');
const searchSection = document.getElementById('search');
const aboutSection = document.getElementById('about');

// Event Handlers
document.getElementById('login-btn').addEventListener('click', toggleLoginForm);
document.getElementById('register-btn').addEventListener('click', toggleRegisterForm);

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Retrieve user role from localStorage

    if (token) {
        axios.get(`${apiUrl}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            // Token is valid, show logged-in UI
            document.getElementById('nav-logged-out').style.display = 'none';
            document.getElementById('nav-logged-in').style.display = 'flex';
            authContent.style.display = 'none';
            carouselContainer.style.display = 'none';

            if (role === 'admin') {
                showAllBooks(true); // Fetch and display all books with admin controls
            } else {
                showAllBooks(false); // Fetch and display all books for normal user
            }
        })
        .catch(error => {
            // Token is invalid or expired, remove it
            localStorage.removeItem('token');
            localStorage.removeItem('role'); // Clear user role from localStorage
            document.getElementById('nav-logged-out').style.display = 'flex';
            document.getElementById('nav-logged-in').style.display = 'none';
        });
    } else {
        document.getElementById('nav-logged-out').style.display = 'flex';
        document.getElementById('nav-logged-in').style.display = 'none';
    }
});

// Event delegation for loan and return buttons
document.body.addEventListener('click', function (event) {
    if (event.target.classList.contains('loan-btn')) {
        loanBook(event.target.dataset.bookId);
    } else if (event.target.classList.contains('return-btn')) {
        returnBook(event.target.dataset.loanedBookId);
    }
});

// Event listener for add book button
document.body.addEventListener('click', function (event) {
    if (event.target.id === 'add-book-btn') {
        showAddBookForm();
    }
});

// Event listener for profile button
document.querySelector('.nav-link[onclick="showUserProfile()"]').addEventListener('click', showUserProfile);

// Initial load of books carousel
document.addEventListener('DOMContentLoaded', viewBooksCarousel);

// Helper function to toggle login form
function toggleLoginForm() {
    if (!formContent.classList.contains('active') || formContent.innerHTML.includes('Sign In')) {
        showLoginForm();
    } else {
        closeForm();
    }
}

// Helper function to toggle register form
function toggleRegisterForm() {
    if (!formContent.classList.contains('active') || formContent.innerHTML.includes('Login')) {
        showRegisterForm();
    } else {
        closeForm();
    }
}

// Display login form
function showLoginForm() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h3>Login</h3>
        <form id="login-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
    `;
    formContent.classList.add('active');
    document.getElementById('login-form').addEventListener('submit', login);
}

// Display register form
function showRegisterForm() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h3>Sign In</h3>
        <form id="register-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" class="form-control" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" required>
            </div>
            <div class="form-group">
                <label for="full_name">Full Name</label>
                <input type="text" class="form-control" id="full_name" required>
            </div>
            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" class="form-control" id="age" required>
            </div>
            <div class="form-group">
                <label for="role">Role</label>
                <select class="form-control" id="role" onchange="toggleAdminPasswordField()">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="form-group" id="admin-password-field" style="display:none;">
                <label for="admin_password">Admin Password (if applicable)</label>
                <input type="password" class="form-control" id="admin_password">
            </div>
            <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
    `;
    formContent.classList.add('active');
    document.getElementById('register-form').addEventListener('submit', register);
}

// Close the currently displayed form
function closeForm() {
    formContent.classList.remove('active');
    formContent.innerHTML = '';
}

// Handle user login
function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    axios.post(`${apiUrl}/login`, { email, password })
        .then(response => {
            const token = response.data.access_token;
            localStorage.setItem('token', token);
            alert('Login successful');
            formContent.innerHTML = '';
            authContent.style.display = 'none';
            userProfile.style.display = 'none';
            carouselContainer.style.display = 'none';
            document.getElementById('nav-logged-out').style.display = 'none';
            document.getElementById('nav-logged-in').style.display = 'flex';
            closeForm();

            axios.get(`${apiUrl}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(userResponse => {
                const user = userResponse.data;
                localStorage.setItem('role', user.role); // Store user role in localStorage
                if (user.role === 'admin') {
                    showAllBooks(true); // Fetch and display all books with admin controls
                } else {
                    showAllBooks(false); // Fetch and display all books for normal user
                }
            })
            .catch(error => {
                console.error('There was an error fetching the user role!', error);
                alert('Error fetching user role');
            });
        })
        .catch(error => {
            console.error('There was an error logging in!', error);
            alert('Invalid credentials');
        });
}

// Handle user registration
function register(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const full_name = document.getElementById('full_name').value;
    const age = document.getElementById('age').value;
    const role = document.getElementById('role').value;
    const admin_password = document.getElementById('admin_password').value;

    axios.post(`${apiUrl}/register`, { email, password, full_name, age, role, admin_password })
        .then(response => {
            alert('Registration successful');
            // Clear the form and display the login form
            closeForm();
        })
        .catch(error => {
            console.error('There was an error registering!', error);
            alert('Error during registration');
        });
}

// Fetch and display all books
function showAllBooks(isAdmin) {
    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/books`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const books = response.data;
        axios.get(`${apiUrl}/user_books`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(userResponse => {
            const userBooks = userResponse.data.filter(book => book.loaned_by_user);
            let html = '<div class="row">';

            // Add admin buttons if the user is an admin
            if (isAdmin) {
                html += `
                <div class="col-12 mb-4">
                    <button class="btn btn-info" id="show-all-users-btn">Show All Users</button>
                    <button class="btn btn-info" id="show-all-loaned-books-btn">Show All Loaned Books</button>
                    <button class="btn btn-info" id="show-all-late-loans-btn">Show All Late Loans</button>
                    <button class="btn btn-success" id="add-book-btn">Add Book</button>
                </div>
                `;
            }

            books.forEach(book => {
                const userLoanedBook = userBooks.find(userBook => userBook.id === book.id);
                html += `
                <div class="col-md-2 col-sm-4 col-6">
                    <div class="card mb-4">
                        <img src="${apiUrl}/media/${book.filename}" class="card-img-top" alt="${book.name}">
                        <div class="card-body">
                            <h5 class="card-title">${book.name}</h5>
                            <p class="card-text">Author: ${book.author}</p>
                            <p class="card-text">Year Published: ${book.year_published}</p>
                            ${book.available ?
                            (isAdmin ? `<button class="btn btn-danger remove-btn" data-book-id="${book.id}">Remove</button>` :
                                `<button class="btn btn-primary loan-btn" data-book-id="${book.id}">Loan</button>`) :
                            (userLoanedBook ?
                                `<button class="btn btn-secondary return-btn" data-loaned-book-id="${userLoanedBook.id}">Return</button>` :
                                '<span class="text-danger">NOT AVAILABLE</span>')}
                        </div>
                    </div>
                </div>
                `;
            });
            html += '</div>';
            document.getElementById('book-content').innerHTML = html;
            document.getElementById('book-content').style.display = 'block';

            // Add event listeners for the "Remove" buttons if admin
            if (isAdmin) {
                document.querySelectorAll('.remove-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        removeBook(this.dataset.bookId);
                    });
                });

                document.getElementById('show-all-users-btn').addEventListener('click', showAllUsers);
                document.getElementById('show-all-loaned-books-btn').addEventListener('click', showAllLoanedBooks);
                document.getElementById('show-all-late-loans-btn').addEventListener('click', showAllLateLoans);
            }
        })
        .catch(error => {
            console.error('There was an error fetching the user\'s loaned books!', error);
            alert('Error fetching user\'s loaned books');
        });
    })
    .catch(error => {
        console.error('There was an error fetching the books!', error);
        alert('Error fetching books');
    });
}

// Handle book loan
function loanBook(bookId) {
    const token = localStorage.getItem('token');
    axios.post(`${apiUrl}/loan_book/${bookId}`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        alert('Book loaned successfully! Return by: ' + response.data.return_date);
        // Update the UI to show the return button
        const loanBtn = document.querySelector(`.loan-btn[data-book-id="${bookId}"]`);
        if (loanBtn) {
            loanBtn.style.display = 'none';
            const cardBody = loanBtn.closest('.card-body');
            const returnBtn = document.createElement('button');
            returnBtn.className = 'btn btn-secondary return-btn';
            returnBtn.dataset.loanedBookId = bookId; // Assuming the same bookId can be used here
            returnBtn.textContent = 'Return';
            returnBtn.style.display = 'block';
            cardBody.appendChild(returnBtn);

            // Add event listener to the new return button
            returnBtn.addEventListener('click', function () {
                returnBook(bookId);
            });
        }
    })
    .catch(error => {
        console.error('There was an error loaning the book!', error);
        alert('Error loaning book');
    });
}

// Handle book return
function returnBook(loanedBookId) {
    const token = localStorage.getItem('token');
    axios.post(`${apiUrl}/return_book/${loanedBookId}`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        alert('Book returned successfully!');
        // Update the UI to show the loan button
        const returnBtn = document.querySelector(`.return-btn[data-loaned-book-id="${loanedBookId}"]`);
        const loanBtn = returnBtn.previousElementSibling;
        returnBtn.style.display = 'none';
        loanBtn.style.display = 'block';
    })
    .catch(error => {
        console.error('There was an error returning the book!', error);
        alert('Error returning book');
    });
}

// Show user profile
function showUserProfile() {
    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const user = response.data;
        const userProfile = document.getElementById('user-profile');
        userProfile.innerHTML = `
        <span class="close-btn" onclick="closeUserProfile()">&times;</span>
        <h3>User Profile</h3>
        <p>Email: ${user.email}</p>
        <p>Full Name: ${user.full_name}</p>
        <p>Age: ${user.age}</p>
        <p>Role: ${user.role}</p>
        `;
        userProfile.style.display = 'block';
    })
    .catch(error => {
        console.error('There was an error fetching the user profile!', error);
        alert('Error loading user profile');
    });
}

// Close user profile
function closeUserProfile() {
    const userProfile = document.getElementById('user-profile');
    userProfile.style.display = 'none';
}

// Handle user logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Clear user role from localStorage
    document.getElementById('nav-logged-out').style.display = 'flex';
    document.getElementById('nav-logged-in').style.display = 'none';
    authContent.style.display = 'block';
    carouselContainer.style.display = 'block';
    userProfile.style.display = 'none';
    formContent.innerHTML = ''; // Clear any form content
    bookContent.style.display = 'none'; // Hide book content
    aboutSection.style.display = 'none'; // Hide about section
    searchSection.style.display = 'none'; // Hide search section
    alert('Logout successful');
    showSection('home'); // Redirect to the home section
}

// Show specific section (home or about)
function showSection(section) {
    const sections = ['home', 'about'];
    sections.forEach(sec => {
        document.getElementById(sec).style.display = sec === section ? 'block' : 'none';
    });
    if (section === 'home') {
        document.getElementById('auth-content').style.display = 'block';
        document.getElementById('carousel-container').style.display = 'block';
    } else {
        document.getElementById('auth-content').style.display = 'none';
        document.getElementById('carousel-container').style.display = 'none';
    }
    document.getElementById('form-content').innerHTML = '';
    document.getElementById('book-content').innerHTML = '';
    document.getElementById('user-profile').style.display = 'none';
}

// Toggle admin password field visibility
function toggleAdminPasswordField() {
    const roleSelect = document.getElementById('role');
    const adminPasswordField = document.getElementById('admin-password-field');
    if (roleSelect.value === 'admin') {
        adminPasswordField.style.display = 'block';
    } else {
        adminPasswordField.style.display = 'none';
    }
}

// View books carousel
function viewBooksCarousel() {
    axios.get(`${apiUrl}/books`)
    .then(response => {
        const books = response.data;
        const totalSlides = Math.ceil(books.length / 5);
        let html = `
            <div id="booksCarousel" class="carousel slide" data-ride="carousel">
                <div class="carousel-inner">
        `;
        for (let i = 0; i < books.length; i += 5) {
            html += `
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <div class="row">
            `;
            for (let j = i; j < i + 5 && j < books.length; j++) {
                html += `
                    <div class="col-md-2 col-sm-4">
                        <div class="card mb-4">
                            <img src="${apiUrl}/media/${books[j].filename}" class="card-img-top" alt="${books[j].name}">
                            <div class="card-body">
                                <h5 class="card-title">${books[j].name}</h5>
                                <p class="card-text">Author: ${books[j].author}</p>
                                <p class="card-text">Year Published: ${books[j].year_published}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            html += `
                    </div>
                </div>
            `;
        }
        html += `
                </div>
                <a class="carousel-control-prev custom-control-prev" href="#booksCarousel" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon custom-icon" aria-hidden="true"></span>
                    <span class="sr-only">Previous</span>
                </a>
                <a class="carousel-control-next custom-control-next" href="#booksCarousel" role="button" data-slide="next">
                    <span class="carousel-control-next-icon custom-icon" aria-hidden="true"></span>
                    <span class="sr-only">Next</span>
                </a>
                <div class="carousel-slide-indicator text-center mt-2">
                    <span id="carousel-slide-indicator">1/${totalSlides}</span>
                </div>
            </div>
        `;
        carouselContainer.innerHTML = html;

        $('#booksCarousel').on('slid.bs.carousel', function (e) {
            const currentIndex = $(e.relatedTarget).index();
            const slideNumber = currentIndex + 1;
            document.getElementById('carousel-slide-indicator').textContent = `${slideNumber}/${totalSlides}`;
        });
    })
    .catch(error => {
        console.error('There was an error fetching the books!', error);
        alert('Error fetching books');
    });
}

// Remove a book (admin only)
function removeBook(bookId) {
    const token = localStorage.getItem('token');
    axios.post(`${apiUrl}/remove_book/${bookId}`, {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        alert('Book removed successfully');
        showAllBooks(true); // Refresh the list of books
    })
    .catch(error => {
        console.error('There was an error removing the book!', error);
        alert('Error removing book');
    });
}

// Show all users (admin only)
function showAllUsers() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h2>All Users</h2>
        <div id="users-list" class="row"></div>
    `;
    formContent.classList.add('active');

    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/display_all_users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const users = response.data;
        let html = '';
        if (users.length > 0) {
            users.forEach(user => {
                html += `
                <div class="col-md-4 col-sm-6">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">${user.full_name}</h5>
                            <p class="card-text">Email: ${user.email}</p>
                            <p class="card-text">Age: ${user.age}</p>
                            <p class="card-text">Role: ${user.role}</p>
                        </div>
                    </div>
                </div>
                `;
            });
        } else {
            html += '<p>No active users found.</p>';
        }
        document.getElementById('users-list').innerHTML = html;
    })
    .catch(error => {
        console.error('There was an error fetching the users!', error);
        alert('Error fetching users');
    });
}

// Show all loaned books (admin only)
function showAllLoanedBooks() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h2>All Loaned Books</h2>
        <div id="loaned-books-list" class="row"></div>
    `;
    formContent.classList.add('active');

    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/display_active_loaned_books`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const loanedBooks = response.data;
        let html = '';
        if (loanedBooks.length > 0) {
            loanedBooks.forEach(book => {
                html += `
                <div class="col-md-4 col-sm-6">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">${book.book_name}</h5>
                            <p class="card-text">Author: ${book.author}</p>
                            <p class="card-text">Loaned By: ${book.user_name}</p>
                            <p class="card-text">Loan Date: ${book.loan_date}</p>
                            <p class="card-text">Return Date: ${book.return_date}</p>
                        </div>
                    </div>
                </div>
                `;
            });
        } else {
            html += '<p>No loaned books found.</p>';
        }
        document.getElementById('loaned-books-list').innerHTML = html;
    })
    .catch(error => {
        console.error('There was an error fetching the loaned books!', error);
        alert('Error fetching loaned books');
    });
}

// Show all late loans (admin only)
function showAllLateLoans() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h2>All Late Loans</h2>
        <div id="late-loans-list" class="row"></div>
    `;
    formContent.classList.add('active');

    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/display_late_loans`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const lateLoans = response.data;
        let html = '';
        if (lateLoans.length > 0) {
            lateLoans.forEach(loan => {
                html += `
                <div class="col-md-4 col-sm-6">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">${loan.book_name}</h5>
                            <p class="card-text">Author: ${loan.author}</p>
                            <p class="card-text">Loaned By: ${loan.user_name}</p>
                            <p class="card-text">Loan Date: ${loan.loan_date}</p>
                            <p class="card-text">Due Date: ${loan.return_date}</p>
                        </div>
                    </div>
                </div>
                `;
            });
        } else {
            html += '<p>No expired loans.</p>';
        }
        document.getElementById('late-loans-list').innerHTML = html;
    })
    .catch(error => {
        console.error('There was an error fetching the late loans!', error);
        alert('Error fetching late loans');
    });
}

// Close the currently displayed form
function closeForm() {
    formContent.classList.remove('active');
    formContent.innerHTML = '';
}

// Show add book form (admin only)
function showAddBookForm() {
    formContent.innerHTML = `
        <span class="close-btn" onclick="closeForm()">&times;</span>
        <h3>Add Book</h3>
        <form id="add-book-form">
            <div class="form-group">
                <label for="book-name">Book Name</label>
                <input type="text" class="form-control" id="book-name" required>
            </div>
            <div class="form-group">
                <label for="author">Author</label>
                <input type="text" class="form-control" id="author" required>
            </div>
            <div class="form-group">
                <label for="year-published">Year Published</label>
                <input type="number" class="form-control" id="year-published" required>
            </div>
            <div class="form-group">
                <label for="type">Type</label>
                <select class="form-control" id="type" required>
                    <option value="1">Loan for 10 days</option>
                    <option value="2">Loan for 30 days</option>
                </select>
            </div>
            <div class="form-group">
                <label for="image">Image</label>
                <input type="file" class="form-control" id="image">
            </div>
            <button type="submit" class="btn btn-primary">Add Book</button>
        </form>
    `;
    formContent.classList.add('active');
    document.getElementById('add-book-form').addEventListener('submit', addBook);
}

// Handle add book form submission
function addBook(event) {
    event.preventDefault();

    const bookData = {
        name: document.getElementById('book-name').value,
        author: document.getElementById('author').value,
        year_published: document.getElementById('year-published').value,
        type: document.getElementById('type').value
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(bookData));

    const imageInput = document.getElementById('image');
    if (imageInput.files.length > 0) {
        formData.append('image', imageInput.files[0]);
    }

    const token = localStorage.getItem('token');
    axios.post(`${apiUrl}/add_book`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        alert('Book added successfully!');
        closeForm();
        showAllBooks(true); // Refresh the list of books
    })
    .catch(error => {
        console.error('There was an error adding the book!', error.response);
        if (error.response && error.response.data && error.response.data.message) {
            alert('Error adding book: ' + error.response.data.message);
        } else {
            alert('Error adding book. Please check the console for details.');
        }
    });
}
