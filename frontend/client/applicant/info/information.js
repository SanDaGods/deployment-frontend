document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "https://eteeapbackend-production.up.railway.app";

  function showAlert(message, type = "info") {
    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;

    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add("fade-out");
      setTimeout(() => alertBox.remove(), 500);
    }, 3000);
  }

  function updateDropdowns() {
    const selectedValues = new Set();
    document.querySelectorAll("select").forEach((select) => {
      if (select.value) selectedValues.add(select.value);
    });

    document.querySelectorAll("select option").forEach((option) => {
      option.hidden = false;
    });

    document.querySelectorAll("select").forEach((select) => {
      const selected = select.value;
      select.querySelectorAll("option").forEach((option) => {
        if (selectedValues.has(option.value) && option.value !== selected) {
          option.hidden = true;
        }
      });
    });
  }

  document.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", updateDropdowns);
  });

  const phoneInput = document.querySelector("#mobile-number");
  if (phoneInput) {
    const iti = window.intlTelInput(phoneInput, {
      initialCountry: "auto",
      geoIpLookup: function (callback) {
        fetch("https://ipinfo.io/json?token=YOUR_TOKEN")
          .then((response) => response.json())
          .then((data) => callback(data.country))
          .catch(() => callback("us"));
      },
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
      nationalMode: false,
      separateDialCode: true,
      preferredCountries: ["ph", "us", "gb"],
      customPlaceholder: (placeholder) => "e.g. " + placeholder,
    });

    phoneInput.addEventListener("blur", () => {
      if (phoneInput.value.trim()) {
        if (!iti.isValidNumber()) {
          phoneInput.classList.add("error");
          showAlert("Please enter a valid phone number", "error");
        } else {
          phoneInput.classList.remove("error");
        }
      }
    });
  }

  const personalForm = document.getElementById("personalForm");
  if (personalForm) {
    personalForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const requiredFields = [
        "firstname", "lastname", "gender", "age", "occupation", "nationality",
        "civilstatus", "birth-date", "birthplace", "mobile-number",
        "email-address", "country", "province", "city", "street", "zip-code",
        "First-prio"
      ];

      let isValid = true;
      requiredFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
          field?.classList.add("error");
          isValid = false;
        } else {
          field?.classList.remove("error");
        }
      });

      if (!isValid) {
        showAlert("Please fill in all required fields", "error");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        showAlert("Session expired. Please login again.", "error");
        setTimeout(() => {
          window.location.href = "https://eteeap-domain-new.vercel.app/index.html";
        }, 2000);
        return;
      }

      const personalInfo = {
        firstname: document.getElementById("firstname").value.trim(),
        middlename: document.getElementById("middlename").value.trim(),
        lastname: document.getElementById("lastname").value.trim(),
        suffix: document.getElementById("suffix").value.trim(),
        gender: document.getElementById("gender").value,
        age: parseInt(document.getElementById("age").value) || 0,
        occupation: document.getElementById("occupation").value.trim(),
        nationality: document.getElementById("nationality").value.trim(),
        civilstatus: document.getElementById("civilstatus").value,
        birthDate: document.getElementById("birth-date").value,
        birthplace: document.getElementById("birthplace").value.trim(),
        mobileNumber: document.getElementById("mobile-number").value.trim(),
        telephoneNumber: document.getElementById("telephone-number").value.trim(),
        emailAddress: document.getElementById("email-address").value.trim(),
        country: document.getElementById("country").value.trim(),
        province: document.getElementById("province").value.trim(),
        city: document.getElementById("city").value.trim(),
        street: document.getElementById("street").value.trim(),
        zipCode: document.getElementById("zip-code").value.trim(),
        firstPriorityCourse: document.getElementById("First-prio").value,
        secondPriorityCourse: document.getElementById("second-prio").value,
        thirdPriorityCourse: document.getElementById("third-prio").value,
      };

      const submitButton = personalForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner"></span> Next Page';

      try {
        const response = await fetch(`${BACKEND_URL}/api/update-personal-info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, personalInfo }),
        });

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok || (isJson && !data.success)) {
          const errorMessage = isJson
            ? data?.error || "Submission failed"
            : `Submission failed: ${data}`;
          throw new Error(errorMessage);
        }

        showAlert("Information submitted successfully!", "success");

        // ✅ Redirect to filesubmission.html in same directory
        setTimeout(() => {
          window.location.href = "filesubmission.html";
        }, 1500);
      } catch (error) {
        console.error("Submission error:", error);
        showAlert(`Error: ${error.message}`, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Next Page";
      }
    });
  }

  const requiredFields = [
    "firstname", "lastname", "gender", "age", "occupation", "nationality",
    "civilstatus", "birth-date", "birthplace", "mobile-number",
    "email-address", "country", "province", "city", "street", "zip-code",
    "First-prio"
  ];

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field?.addEventListener("input", () => {
      if (field.value.trim()) {
        field.classList.remove("error");
      }
    });
  });

  const birthDateInput = document.getElementById("birth-date");
  const ageInput = document.getElementById("age");

  if (birthDateInput) {
    birthDateInput.max = new Date().toISOString().split("T")[0];

    if (ageInput) {
      birthDateInput.addEventListener("change", function () {
        if (this.value) {
          const birthDate = new Date(this.value);
          const ageDiff = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDiff);
          const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
          ageInput.value = calculatedAge;
        }
      });
    }
  }
});

// CSS injection
const dynamicStyles = `
  .alert {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 5px;
      color: white;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(0);
      transition: all 0.3s ease;
  }
  .alert.info { background-color: #2196F3; }
  .alert.success { background-color: #4CAF50; }
  .alert.warning { background-color: #FF9800; }
  .alert.error { background-color: #F44336; }
  .alert.fade-out { transform: translateX(100%); opacity: 0; }
  .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
  }
  @keyframes spin {
      to { transform: rotate(360deg); }
  }
  .error { border-color: #ff4444 !important; }
`;
const styleElement = document.createElement("style");
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);
