document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('remember-me');

  // Check if admin is already logged in
  checkAdminAuthStatus();

  // Handle form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Clear previous errors
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Basic client-side validation
    if (!email || !password) {
      showError('Email and password are required');
      return;
    }

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }

      // Redirect to dashboard on successful login
      if (data.redirectTo) {
        window.location.href = data.redirectTo;
      } else {
        window.location.href = '/client/admin/dashboard/dashboard.html';
      }

    } catch (error) {
      showError(error.message);
    }
  });

  // Pre-fill email if "Remember me" was checked
  const savedEmail = localStorage.getItem('adminEmail');
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberMeCheckbox.checked = true;
  }

  // Check authentication status
  async function checkAdminAuthStatus() {
    try {
      const response = await fetch('/admin/auth-status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.authenticated) {
        // If already logged in, redirect to dashboard
        window.location.href = '/client/admin/dashboard/dashboard.html';
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  // Display error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.color = '#dc3545'; // Red color for errors
    errorMessage.style.marginTop = '10px';
    errorMessage.style.textAlign = 'center';
  }
});