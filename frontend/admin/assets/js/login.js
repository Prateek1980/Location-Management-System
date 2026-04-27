const API = "http://127.0.0.1:8000";

async function login() {
    const errorEl = document.getElementById("errorMsg");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    errorEl.innerText = "";

    if (!email || !password) {
        errorEl.innerText = "Enter both email and password.";
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.innerText = data.error || "Login failed. Please try again.";
            return;
        }

        if (data.error) {
            errorEl.innerText = data.error;
            return;
        }

        localStorage.setItem("token", data.token || "");
        localStorage.setItem("name", data.name || "");
        localStorage.setItem("role", data.role || "");
        localStorage.setItem("email", data.email || "");

        window.location.href = "../home/home.html";
    } catch (error) {
        // This usually indicates API is down or blocked by CORS/network policy.
        errorEl.innerText = "Cannot reach backend. Start API and open frontend via Live Server (http://127.0.0.1:5500).";
    }
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        login();
    });
}

window.login = login;

