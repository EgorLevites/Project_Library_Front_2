const apiUrl = 'http://127.0.0.1:5000';

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

// Handlers
document.getElementById('login-btn').addEventListener('click', toggleLoginForm);
document.getElementById('register-btn').addEventListener('click', toggleRegisterForm);
document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    searchBooks(query);
});

// Initial Load
document.addEventListener('DOMContentLoaded', viewBooksCarousel);

// Helper Functions
function toggleLoginForm() {
    if (formContent.innerHTML.trim() === '' || formContent.innerHTML.includes('Register')) {
        showLoginForm();
    } else {
        formContent.innerHTML = '';
    }
}

function toggleRegisterForm() {
    if (formContent.innerHTML.trim() === '' || formContent.innerHTML.includes('Login')) {
        showRegisterForm();
    } else {
        formContent.innerHTML = '';
    }
}

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

function showLoginForm() {
    formContent.innerHTML = `
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
    document.getElementById('login-form').addEventListener('submit', login);
}

function showRegisterForm() {
    formContent.innerHTML = `
        <h3>Register</h3>
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
            <button type="submit" class="btn btn-primary">Register</button>
        </form>
    `;
    document.getElementById('register-form').addEventListener('submit', register);
}

function toggleAdminPasswordField() {
    const roleSelect = document.getElementById('role');
    const adminPasswordField = document.getElementById('admin-password-field');
    if (roleSelect.value === 'admin') {
        adminPasswordField.style.display = 'block';
    } else {
        adminPasswordField.style.display = 'none';
    }
}

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
            userProfile.style.display = 'block';
            loadUserProfile();
        })
        .catch(error => {
            console.error('There was an error logging in!', error);
            alert('Invalid credentials');
        });
}

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
            formContent.innerHTML = '';
        })
        .catch(error => {
            console.error('There was an error registering!', error);
            alert('Error during registration');
        });
}

function loadUserProfile() {
    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        const user = response.data;
        userProfile.innerHTML = `
            <h3>User Profile</h3>
            <p>Email: ${user.email}</p>
            <p>Full Name: ${user.full_name}</p>
            <p>Age: ${user.age}</p>
            <p>Role: ${user.role}</p>
        `;
    })
    .catch(error => {
        console.error('There was an error loading the user profile!', error);
        alert('Error loading user profile');
    });
}

function showSection(section) {
    const sections = ['home', 'search', 'about'];
    sections.forEach(sec => {
        document.getElementById(sec).style.display = sec === section ? 'block' : 'none';
    });
    if (section === 'home') {
        authContent.style.display = 'block';
        carouselContainer.style.display = 'block';
    } else {
        authContent.style.display = 'none';
        carouselContainer.style.display = 'none';
    }
    formContent.innerHTML = '';
    bookContent.innerHTML = '';
    userProfile.style.display = 'none';
}

function searchBooks(query) {
    axios.get(`${apiUrl}/books`)
        .then(response => {
            const books = response.data;
            const filteredBooks = books.filter(book => book.name.toLowerCase().includes(query.toLowerCase()));
            let html = '';
            if (filteredBooks.length > 0) {
                for (let i = 0; i < filteredBooks.length; i += 5) {
                    html += '<div class="row">';
                    for (let j = i; j < i + 5 && j < filteredBooks.length; j++) {
                        html += `
                            <div class="col-md-2 custom-col-2-4 col-sm-4 col-6">
                                <div class="card mb-4">
                                    <img src="${apiUrl}/media/${filteredBooks[j].filename}" class="card-img-top" alt="${filteredBooks[j].name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${filteredBooks[j].name}</h5>
                                        <p class="card-text">Author: ${filteredBooks[j].author}</p>
                                        <p class="card-text">Year Published: ${filteredBooks[j].year_published}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    html += '</div>';
                }
            } else {
                html = '<p>No books found.</p>';
            }
            document.getElementById('search-results').innerHTML = html;
        })
        .catch(error => {
            console.error('There was an error fetching the books!', error);
            alert('Error fetching books');
        });
}



