async function handleLogin(event, role) {
    event.preventDefault();

    const email = document.getElementById(`${role}-email`).value;
    const password = document.getElementById(`${role}-password`).value;

    try {
        const response = await fetch("https://eteeapbackend-production.up.railway.app/frontend/api//login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");

            // Redirect based on role
            if (data.role === "admin") {
                window.location.href = "/frontend/AdminSide/AdminDashboard/adDogin.html";
            } else {
                window.location.href = "/frontend/ApplicantSide/ApplicantDashboard/ApplicantDashboard.html";
            }
        } else {
            alert(data.error || "Login failed!");
        }
    } catch (error) {
        alert("An error occurred. Please try again later.");
    }
}
