const API = "http://127.0.0.1:8000";

async function register() {

    const messageBox = document.getElementById("message");

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Reset message
    messageBox.innerText = "";
    messageBox.style.color = "red";

    // Validation
    if (!name || !phone || !email || !password || !confirmPassword) {
        messageBox.innerText = "All fields are required.";
        return;
    }

    if (!emailRegex.test(email)) {
        messageBox.innerText = "Please enter a valid email address (example: name@gmail.com)";
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        messageBox.innerText = "Phone number must be exactly 10 digits.";
        return;
    }

    if (password.length < 6) {
        messageBox.innerText = "Password must be at least 6 characters.";
        return;
    }

    if (password !== confirmPassword) {
        messageBox.innerText = "Passwords do not match.";
        return;
    }

    try {

        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (data.error) {
            messageBox.innerText = data.error;
            return;
        }

        messageBox.style.color = "green";
        messageBox.innerText = "Registration successful! Redirecting to login...";

        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 1500);

    } catch (error) {
        messageBox.innerText = "Server error. Please try again.";
    }
}