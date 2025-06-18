document.addEventListener("DOMContentLoaded", () => {
  // File upload handling
  const fileInput = document.getElementById("file-upload");
  const dropArea = document.querySelector(".upload");
  const fileList = document.getElementById("file-list");
  const submitBtn = document.getElementById("submit-btn");
  let uploadedFiles = new Map(); // Track files with metadata

  const userId = localStorage.getItem("userId");
  if (!userId) {
    showAlert("Session expired. Please login again.", "error");
    setTimeout(() => {
      window.location.href = "/client/Applicant/Login/login.html";
    }, 2000);
    return;
  }

  // Maximum file size (25MB)
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  // Allowed file types
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  // Handle file selection and drops
  function handleFiles(files) {
    if (files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showAlert(`File "${file.name}" exceeds the 25MB limit.`, "error");
        return;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        showAlert(
          `File "${file.name}" has an unsupported format. Only PDF, JPG, PNG, and DOC/DOCX are allowed.`,
          "error"
        );
        return;
      }

      // Check for duplicate files
      if (uploadedFiles.has(file.name)) {
        showAlert(`File "${file.name}" is already uploaded.`, "warning");
        return;
      }

      // Generate a unique ID for the file
      const fileId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);

      // Store file with metadata
      uploadedFiles.set(file.name, {
        id: fileId,
        file: file,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        label: "initial-submission",
        owner: userId,
      });

      // Create file item element
      const fileItem = document.createElement("div");
      fileItem.classList.add("file-item");
      fileItem.dataset.fileId = fileId;

      const fileInfo = document.createElement("div");
      fileInfo.classList.add("file-info");

      const fileName = document.createElement("p");
      fileName.classList.add("file-name");
      fileName.textContent = file.name;

      const fileSize = document.createElement("span");
      fileSize.classList.add("file-size");
      fileSize.textContent = formatFileSize(file.size);

      // Create remove button
      const removeButton = document.createElement("button");
      removeButton.textContent = "×";
      removeButton.classList.add("remove-btn");
      removeButton.title = "Remove file";

      // Remove file handler
      removeButton.onclick = function () {
        fileItem.remove();
        uploadedFiles.delete(file.name);
        updateFileCount();
      };

      // Add preview for images
      if (file.type.startsWith("image/")) {
        const filePreview = document.createElement("div");
        filePreview.classList.add("file-preview-container");

        const imgPreview = document.createElement("img");
        imgPreview.classList.add("file-preview");
        imgPreview.src = URL.createObjectURL(file);

        filePreview.appendChild(imgPreview);
        fileItem.appendChild(filePreview);
      }

      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileSize);
      fileItem.appendChild(fileInfo);
      fileItem.appendChild(removeButton);
      fileList.appendChild(fileItem);

      updateFileCount();
    });
  }

  // Format file size for display
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Update the file counter display
  function updateFileCount() {
    const counter = document.getElementById("file-count");
    if (counter) {
      counter.textContent = `${uploadedFiles.size} file(s) selected`;
    }
  }

  // Show alert message
  function showAlert(message, type = "info") {
    // Remove any existing alerts first
    const existingAlerts = document.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());

    const alertBox = document.createElement("div");
    alertBox.className = `alert ${type}`;
    alertBox.textContent = message;

    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add("fade-out");
      setTimeout(() => alertBox.remove(), 500);
    }, 3000);
  }

  // File input change event
  fileInput.addEventListener("change", function () {
    handleFiles(this.files);
    this.value = ""; // Reset to allow selecting same file again
  });

  // Drag and drop events
  ["dragenter", "dragover"].forEach((event) => {
    dropArea.addEventListener(event, (e) => {
      e.preventDefault();
      dropArea.classList.add("drag-active");
    });
  });

  ["dragleave", "drop"].forEach((event) => {
    dropArea.addEventListener(event, (e) => {
      e.preventDefault();
      dropArea.classList.remove("drag-active");
    });
  });

  dropArea.addEventListener("drop", (e) => {
    handleFiles(e.dataTransfer.files);
  });

  // Prevent file manager from opening twice
  dropArea.addEventListener("click", (e) => {
    if (e.target === dropArea) {
      fileInput.click();
    }
  });

  // Submit button handler
  submitBtn.addEventListener("click", async () => {
    // Validate at least one file is uploaded
    if (uploadedFiles.size === 0) {
      showAlert("Please upload at least one document", "error");
      return;
    }

    try {
      // Update UI for submission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

      // Create FormData object
      const formData = new FormData();

      formData.append("userId", userId);

      // Add all files to FormData
      Array.from(uploadedFiles.values()).forEach((fileData) => {
        formData.append("files", fileData.file);
      });

      // Send the request (replace with your actual endpoint)
      const response = await fetch("/api/submit-documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit documents");
      }

      // Show success and redirect
      showAlert("Documents submitted successfully!", "success");
      setTimeout(() => {
        window.location.href = "../Timeline/timeline.html";
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Documents";
    }
  });
});

// CSS for dynamic elements
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
    .alert.info {
        background-color: #2196F3;
    }
    .alert.success {
        background-color: #4CAF50;
    }
    .alert.warning {
        background-color: #FF9800;
    }
    .alert.error {
        background-color: #F44336;
    }
    .alert.fade-out {
        transform: translateX(100%);
        opacity: 0;
    }
    .file-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        margin: 5px 0;
        background: #f5f5f5;
        border-radius: 4px;
        gap: 10px;
    }
    .file-info {
        flex: 1;
        min-width: 0;
    }
    .file-name {
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .file-size {
        font-size: 0.8em;
        color: #666;
    }
    .file-preview-container {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
        border-radius: 3px;
        overflow: hidden;
    }
    .file-preview {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    .remove-btn {
        background: #ff4444;
        color: white;
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .drag-active {
        border-color: #532989 !important;
        background-color: #f0e6ff !important;
    }
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
`;

// Add styles to the document
const styleElement = document.createElement("style");
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);
