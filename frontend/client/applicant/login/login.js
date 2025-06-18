document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.querySelector(".wrapper");

  if (wrapper) {
    wrapper.classList.add("active-popup");
  }

  const buttons = {
    close: document.querySelector(".icon-close"),
    registerLink: document.querySelector(".register-link"),
    loginLink: document.querySelector(".login-link"),
    forgotLink: document.querySelector(".forgot-link"),
  };

  if (document.referrer) {
    sessionStorage.setItem("previousPage", document.referrer);
  }

  const resetInputs = () => {
    wrapper?.querySelectorAll("input").forEach((input) => {
      if (input.type === "checkbox") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
  };

  const showForm = (formType = "") => {
    wrapper?.classList.remove(
      "active",
      "active-forgot",
      "active-verification",
      "active-new-password"
    );
    if (formType) wrapper?.classList.add(formType);
    resetInputs();
  };

  buttons.registerLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("active");
  });

  buttons.loginLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("");
  });

  buttons.forgotLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("active-forgot");
  });

  const resetForm = document.getElementById("resetForm");
  const verificationForm = document.getElementById("verificationForm");
  const newPasswordForm = document.getElementById("newPasswordForm");

  resetForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector(".form-box.forgot").style.display = "none";
    verificationForm.style.display = "block";
    wrapper.classList.add("active-verification");
  });

  const verifyCodeForm = document.getElementById("verifyCodeForm");
  verifyCodeForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    verificationForm.style.display = "none";
    newPasswordForm.style.display = "block";
    wrapper.classList.add("active-new-password");
  });

  const newPasswordSubmit = document.getElementById("newPasswordSubmit");
  newPasswordSubmit?.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("newConfirmPassword").value;

    if (newPassword !== confirmPassword) {
      showNotification("Passwords do not match. Please try again.");
      return;
    }

    showNotification("Password successfully reset! Redirecting to login page...");
    showForm("");
  });

  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.parentElement.querySelector("input");
      const icon = toggle.querySelector("ion-icon");

      if (input.type === "password") {
        input.type = "text";
        icon.setAttribute("name", "eye");
      } else {
        input.type = "password";
        icon.setAttribute("name", "eye-off");
      }
    });
  });

  document.getElementById("terms-link")?.addEventListener("click", function (event) {
    event.preventDefault();
    document.getElementById("terms-con").style.display = "block";
  });

  document.getElementById("accept-btn")?.addEventListener("click", function () {
    document.getElementById("terms-con").style.display = "none";
    document.getElementById("terms-checkbox").checked = true;
  });

  buttons.close?.addEventListener("click", () => {
    resetInputs();
    wrapper?.classList.remove(
      "active-popup",
      "active",
      "active-forgot",
      "active-verification",
      "active-new-password"
    );
    window.location.href = "https://eteeap-domain-new.vercel.app/index.html";
  });

  const BACKEND_URL = "https://eteeapbackend-production.up.railway.app";

  // Registration
  document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Register form submitted");

    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (!email || !password || !confirmPassword) {
      showNotification("Please fill in all fields");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showNotification("Please enter a valid email address (e.g., user@example.com)");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      showNotification("Password must be at least 8 characters");
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      const responseBody = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = isJson
          ? responseBody?.error || "Registration failed"
          : `Registration failed: ${responseBody}`;
        throw new Error(errorMessage);
      }

      showNotification("Registration successful! Please fill out your personal information.");
      localStorage.setItem("userId", responseBody.data.userId);
      localStorage.setItem("applicantId", responseBody.data.applicantId);
      window.location.href = "https://eteeap-domain-new.vercel.app/frontend/client/applicant/info/information.html";
    } catch (error) {
      console.error("Registration error:", error);
      showNotification(`Registration failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Login
  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showNotification("Please enter both email and password.");
      return;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const responseBody = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = isJson
          ? responseBody?.error || "Login failed"
          : `Login failed: ${responseBody}`;
        throw new Error(errorMessage);
      }

      showNotification("Login successful!");
      localStorage.setItem("userId", responseBody.data.userId);
      localStorage.setItem("userEmail", responseBody.data.email);
      window.location.href = "https://eteeap-domain-new.vercel.app/frontend/client/applicant/timeline/timeline.html";
    } catch (error) {
      console.error("Login error:", error);
      showNotification(error.message || "Login failed. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});

function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
