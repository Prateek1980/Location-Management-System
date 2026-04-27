const API = "http://127.0.0.1:8000";

async function sendReset() {

    const email = document.getElementById("email").value;

    const res = await fetch(`${API}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    document.getElementById("msg").innerText = data.message;
}

async function resetPassword() {

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageBox = document.getElementById("msg");

    const token = new URLSearchParams(window.location.search).get("token");

    // Clear previous message
    messageBox.innerText = "";
    messageBox.style.color = "red";

    // Check empty fields
    if (!newPassword || !confirmPassword) {
        messageBox.innerText = "Please fill all fields.";
        return;
    }

    // Confirm password match
    if (newPassword !== confirmPassword) {
        messageBox.innerText = "Passwords do not match.";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token,
                new_password: newPassword
            })
        });

        const data = await res.json();

        if (data.error) {
            messageBox.innerText = data.error;
            return;
        }

        // Success message
        messageBox.style.color = "green";
        messageBox.innerText = "Password reset successful! Redirecting to login...";

        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 2000);

    } catch (error) {
        messageBox.innerText = "Something went wrong. Please try again.";
    }
}