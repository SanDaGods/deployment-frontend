const API_BASE_URL = "https://eteeapbackend-production.up.railway.app/frontend/api/";
let currentApplicant = null;
let applicantId = null;

// Utility Functions
function showLoading() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'flex';
}

function hideLoading() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) spinner.style.display = 'none';
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Get applicant ID from URL or sessionStorage
function getApplicantId() {
  // First try to get from URL
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');

  // If not in URL, try sessionStorage
  if (!id) {
    id = sessionStorage.getItem('currentApplicantId');
  }

  if (!id) {
    showNotification('No applicant ID provided. Redirecting...', 'error');
    setTimeout(() => {
      window.location.href = '/client/admin/applicants/applicants.html';
    }, 2000);
    return null;
  }

  return id;
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

// Update status badge appearance
function updateStatusBadge(status) {
  const badge = document.getElementById('statusBadge');
  if (!badge) return;
  
  badge.textContent = status || 'Pending Review';
  badge.className = 'status-badge ';
  
  if (status === 'Approved') {
    badge.classList.add('status-approved');
  } else if (status === 'Rejected') {
    badge.classList.add('status-rejected');
  } else {
    badge.classList.add('status-pending');
  }
}

// Safely set text content for an element
function setTextContent(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text || 'N/A';
  }
}

// Load applicant data from server
async function loadApplicantData() {
  showLoading();
  
  try {
    // Verify admin is authenticated first
    const authResponse = await fetch(`${API_BASE_URL}/admin/auth-status`, {
      credentials: 'include'
    });
    
    if (!authResponse.ok) {
      window.location.href = '/client/admin/login/login.html';
      return;
    }
    
    // Fetch applicant data
    const response = await fetch(`${API_BASE_URL}/api/admin/applicants/${applicantId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch applicant: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to load applicant data');
    }
    
    currentApplicant = data.data;
    displayApplicantData(data.data);
    
  } catch (error) {
    console.error('Error loading applicant data:', error);
    showNotification(error.message, 'error');
    setTimeout(() => {
      window.location.href = '/client/admin/applicants/applicants.html';
    }, 2000);
  } finally {
    hideLoading();
  }
}

// Display applicant data in the UI
function displayApplicantData(applicant) {
  if (!applicant) return;
  
  // Basic info
  setTextContent('applicantId', applicant.applicantId);
  setTextContent('email', applicant.email);
  updateStatusBadge(applicant.status);
  setTextContent('createdAt', formatDate(applicant.createdAt));
  
  // Personal info section
  if (applicant.personalInfo) {
    const info = applicant.personalInfo;
    
    // Profile header
    const nameElement = document.getElementById('profile-name');
    if (nameElement) {
      nameElement.textContent = 
        `${info.firstname || ''} ${info.middlename || ''} ${info.lastname || ''} ${info.suffix || ''}`.trim() || 'N/A';
    }
    
    const occupationElement = document.getElementById('profile-occupation');
    if (occupationElement) {
      occupationElement.textContent = info.occupation || 'Not specified';
    }
    
    // Contact Information
    setTextContent('profile-email', info.emailAddress || applicant.email);
    setTextContent('profile-phone', info.mobileNumber);
    setTextContent('profile-telephone', info.telephoneNumber);
    
    // Personal Details
    setTextContent('profile-gender', info.gender);
    setTextContent('profile-age', info.age);
    setTextContent('profile-nationality', info.nationality);
    setTextContent('profile-civil-status', info.civilstatus);
    setTextContent('profile-birthdate', formatDate(info.birthDate));
    setTextContent('profile-birthplace', info.birthplace);
    
    // Address Information
    setTextContent('profile-country', info.country);
    setTextContent('profile-province', info.province);
    setTextContent('profile-city', info.city);
    setTextContent('profile-street', info.street);
    setTextContent('profile-zip', info.zipCode);
    
    // Course Priorities
    setTextContent('profile-first-priority', info.firstPriorityCourse);
    setTextContent('profile-second-priority', info.secondPriorityCourse);
    setTextContent('profile-third-priority', info.thirdPriorityCourse);
  }
  
  // Documents
  displayDocuments(applicant.files || []);
}

// Display uploaded documents
function displayDocuments(documents) {
  const container = document.getElementById('documents-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!documents || documents.length === 0) {
    container.innerHTML = `
      <div class="no-documents">
        <i class="fas fa-folder-open"></i>
        <p>No documents submitted yet</p>
      </div>
    `;
    return;
  }
  
  const documentsGrid = document.createElement('div');
  documentsGrid.className = 'documents-grid';
  
  documents.forEach(doc => {
    const fileName = doc.split('/').pop() || 'Document';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    let iconClass = 'fa-file';
    
    if (fileExt === 'pdf') iconClass = 'fa-file-pdf';
    else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) iconClass = 'fa-file-image';
    else if (['doc', 'docx'].includes(fileExt)) iconClass = 'fa-file-word';
    
    const documentCard = document.createElement('div');
    documentCard.className = 'document-card';
    documentCard.innerHTML = `
      <div class="document-icon">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="document-info">
        <p class="document-name">${fileName}</p>
        <div class="document-actions">
          <a href="${API_BASE_URL}/${doc}" target="_blank" class="btn view-btn">
            <i class="fas fa-eye"></i> View
          </a>
          <a href="${API_BASE_URL}/${doc}" download class="btn download-btn">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
      </div>
    `;
    
    documentsGrid.appendChild(documentCard);
  });
  
  container.appendChild(documentsGrid);
}

// Initialize the page
// Update the DOMContentLoaded event listener in ApplicantProfile.js
document.addEventListener('DOMContentLoaded', function() {
  // Get applicant ID
  applicantId = getApplicantId();
  if (!applicantId) return;
  
  // Load applicant data
  loadApplicantData();
  
  // Set up event listeners
  setupModalControls();
  setupAssessorSelection();
  setupAssessorAssignment();
  
  document.getElementById('backButton')?.addEventListener('click', () => {
      window.location.href = '/client/admin/applicants/applicants.html';
  });
  
  
  // Admin logout
  document.getElementById('logoutLink')?.addEventListener('click', function(e) {
    e.preventDefault();
    fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = '/client/admin/login/login.html';
    });
  });
});


// Add these functions to ApplicantProfile.js

// Show modal for assigning assessor
async function showAssignAssessorModal() {
  const modal = document.getElementById('assignAssessorModal');
  const assessorSelect = document.getElementById('assessorSelect');
  
  if (!modal || !assessorSelect) return;
  
  showLoading();
  try {
    // Fetch available assessors
    const response = await fetch(`${API_BASE_URL}/api/admin/available-assessors`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch assessors');
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'No assessors available');
    }
    
    // Populate assessor dropdown
    assessorSelect.innerHTML = '<option value="" disabled selected>Select an assessor</option>';
    data.data.forEach(assessor => {
      const option = document.createElement('option');
      option.value = assessor._id;
      option.textContent = `${assessor.fullName} (${assessor.assessorId}) - ${formatExpertise(assessor.expertise)}`;
      assessorSelect.appendChild(option);
    });
    
    // Show modal
    modal.style.display = 'flex';
    
  } catch (error) {
    console.error('Error loading assessors:', error);
    showNotification(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Format expertise for display
function formatExpertise(expertise) {
  const expertiseMap = {
    "engineering": "Engineering",
    "education": "Education",
    "business": "Business",
    "information_technology": "IT",
    "health_sciences": "Health Sciences",
    "arts_sciences": "Arts & Sciences",
    "architecture": "Architecture",
    "industrial_technology": "Industrial Technology",
    "hospitality_management": "Hospitality Management",
    "other": "Other"
  };
  return expertiseMap[expertise] || expertise;
}

// Handle assessor selection
function setupAssessorSelection() {
  const assessorSelect = document.getElementById('assessorSelect');
  const assessorDetails = document.getElementById('assessorDetails');
  
  if (!assessorSelect || !assessorDetails) return;
  
  assessorSelect.addEventListener('change', async function() {
    const assessorId = this.value;
    if (!assessorId) {
      assessorDetails.style.display = 'none';
      return;
    }
    
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/assessor/${assessorId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessor details');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const assessor = data.data;
        document.getElementById('assessorIdDisplay').textContent = assessor.assessorId;
        document.getElementById('assessorTypeDisplay').textContent = assessor.assessorType === 'internal' ? 'Internal' : 'External';
        document.getElementById('assessorExpertiseDisplay').textContent = formatExpertise(assessor.expertise);
        assessorDetails.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching assessor details:', error);
      assessorDetails.style.display = 'none';
    } finally {
      hideLoading();
    }
  });
}

// Handle assessor assignment
function setupAssessorAssignment() {
  const confirmAssignBtn = document.getElementById('confirmAssignBtn');
  const assessorSelect = document.getElementById('assessorSelect');
  
  if (!confirmAssignBtn || !assessorSelect) return;
  
  confirmAssignBtn.addEventListener('click', async function() {
    const assessorId = assessorSelect.value;
    if (!assessorId) {
      showNotification('Please select an assessor', 'error');
      return;
    }
    
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/applicants/${applicantId}/assign-assessor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessorId: assessorId,
          applicantId: applicantId // Explicitly include both IDs
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign assessor');
      }
      
      if (data.success) {
        showNotification('Assessor assigned successfully!', 'success');
        updateStatusBadge('Under Assessment');
        if (currentApplicant) {
          currentApplicant.status = 'Under Assessment';
          currentApplicant.assignedAssessor = assessorId;
        }
        closeModal();
        
        // Refresh the assessor dashboard data
        if (typeof refreshAssessorDashboard === 'function') {
          refreshAssessorDashboard();
        }
      } else {
        throw new Error(data.error || 'Failed to assign assessor');
      }
    } catch (error) {
      console.error('Error assigning assessor:', error);
      showNotification(error.message, 'error');
    } finally {
      hideLoading();
    }
  });
}

// Modal control functions
function setupModalControls() {
  const modal = document.getElementById('assignAssessorModal');
  if (!modal) return;
  
  // Close modal when clicking X or cancel button
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  
  // Close modal when clicking outside content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('assignAssessorModal');
  if (modal) modal.style.display = 'none';
}

// Update the approve button click handler to show the assessor modal
async function showAssignAssessorModal() {
  const modal = document.getElementById('assignAssessorModal');
  const assessorSelect = document.getElementById('assessorSelect');
  
  if (!modal || !assessorSelect) return;
  
  showLoading();
  try {
    // First approve the application
    const approveResponse = await fetch(`${API_BASE_URL}/api/admin/applicants/${applicantId}/approve`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const approveData = await approveResponse.json();
    
    if (!approveData.success) {
      throw new Error(approveData.error || 'Failed to approve application');
    }

    // Then fetch available assessors
    const assessorsResponse = await fetch(`${API_BASE_URL}/api/admin/available-assessors`, {
      credentials: 'include'
    });
    
    if (!assessorsResponse.ok) {
      throw new Error('Failed to fetch assessors');
    }
    
    const assessorsData = await assessorsResponse.json();
    
    if (!assessorsData.success || !assessorsData.data) {
      throw new Error(assessorsData.error || 'No assessors available');
    }
    
    // Populate assessor dropdown
    assessorSelect.innerHTML = '<option value="" disabled selected>Select an assessor</option>';
    assessorsData.data.forEach(assessor => {
      const option = document.createElement('option');
      option.value = assessor._id;
      option.textContent = `${assessor.fullName} (${assessor.assessorId}) - ${formatExpertise(assessor.expertise)}`;
      assessorSelect.appendChild(option);
    });
    
    // Show modal
    modal.style.display = 'flex';
    
  } catch (error) {
    console.error('Error loading assessors:', error);
    showNotification(error.message, 'error');
    closeModal();
  } finally {
    hideLoading();
  }
}

// Add this to the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // Get applicant ID
  applicantId = getApplicantId();
  if (!applicantId) return;
  
  // Load applicant data
  loadApplicantData();
  
  // Set up event listeners
  document.getElementById('backButton')?.addEventListener('click', () => {
    window.location.href = '/client/admin/applicants/applicants.html';
  });
  
  document.getElementById('approveBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to approve this application?')) return;
    await showAssignAssessorModal();
});

// Update the showAssignAssessorModal function
async function showAssignAssessorModal() {
    const modal = document.getElementById('assignAssessorModal');
    const assessorSelect = document.getElementById('assessorSelect');
    
    if (!modal || !assessorSelect) {
        showNotification('Modal elements not found', 'error');
        return;
    }
    
    showLoading();
    try {
        // First approve the application
        const approveResponse = await fetch(`${API_BASE_URL}/api/admin/applicants/${applicantId}/approve`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const approveData = await approveResponse.json();
        
        if (!approveData.success) {
            throw new Error(approveData.error || 'Failed to approve application');
        }

        // Then fetch available assessors
        const assessorsResponse = await fetch(`${API_BASE_URL}/api/admin/available-assessors`, {
            credentials: 'include'
        });
        
        if (!assessorsResponse.ok) {
            throw new Error('Failed to fetch assessors');
        }
        
        const assessorsData = await assessorsResponse.json();
        
        if (!assessorsData.success || !assessorsData.data) {
            throw new Error(assessorsData.error || 'No assessors available');
        }
        
        // Clear and populate assessor dropdown
        assessorSelect.innerHTML = '<option value="" disabled selected>Select an assessor</option>';
        assessorsData.data.forEach(assessor => {
            const option = document.createElement('option');
            option.value = assessor._id;
            option.textContent = `${assessor.fullName} (${assessor.assessorId}) - ${formatExpertise(assessor.expertise)}`;
            assessorSelect.appendChild(option);
        });
        
        // Show modal
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error loading assessors:', error);
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}
  
  document.getElementById('rejectBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/applicants/${applicantId}/reject`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Application rejected successfully!', 'success');
        updateStatusBadge('Rejected');
        if (currentApplicant) currentApplicant.status = 'Rejected';
      } else {
        throw new Error(data.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      showNotification(error.message, 'error');
    } finally {
      hideLoading();
    }
  });
  
  // Admin logout
  document.getElementById('logoutLink')?.addEventListener('click', function(e) {
    e.preventDefault();
    fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      window.location.href = '/client/admin/login/login.html';
    });
  });
});


function updateStatus() {
  const status = document.getElementById("status").value;
  fetch(`https://eteeapbackend-production.up.railway.app/frontend/api//api/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }).then(res => res.json())
    .then(data => alert('Status updated to ' + data.status));
}