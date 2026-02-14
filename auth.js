/**
 * Authentication Logic
 * Handles Login, Registration, and Session Management using LocalStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');

            if (authenticateUser(email, password)) {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError(errorMsg, 'Invalid email or password.');
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const location = document.getElementById('location').value;
            const userType = document.getElementById('userType').value;
            const errorMsg = document.getElementById('errorMsg');
            const successMsg = document.getElementById('successMsg');

            if (userExists(email)) {
                showError(errorMsg, 'User with this email already exists.');
                return;
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password, // In a real app, hash this!
                location,
                userType,
                joinedDate: new Date().toISOString()
            };

            saveUser(newUser);

            // Show success and redirect
            registerForm.reset();
            successMsg.style.display = 'block';
            successMsg.textContent = 'Registration successful! Redirecting to login...';

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
});


// --- Helper Functions ---

function getUsers() {
    const users = localStorage.getItem('krishi_users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('krishi_users', JSON.stringify(users));
}

function userExists(email) {
    const users = getUsers();
    return users.some(u => u.email === email);
}

function authenticateUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Create Session
        localStorage.setItem('krishi_currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('krishi_currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = localStorage.getItem('krishi_currentUser');
    if (!user) {
        window.location.href = 'login.html';
    }
    return JSON.parse(user);
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = 'var(--danger)';

    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}
