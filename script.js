// DOM Elements
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const prescriptionForm = document.getElementById('prescription-form');
const fileUpload = document.getElementById('file-upload');
const fileUploadContainer = document.querySelector('.file-upload');

// Mobile Menu Toggle
if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
    });
}

// Handle file upload drag and drop
if (fileUpload && fileUploadContainer) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadContainer.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    fileUploadContainer.addEventListener('drop', handleDrop, false);

    // Open file dialog when clicking the upload area
    fileUploadContainer.addEventListener('click', () => {
        fileUpload.click();
    });

    // Handle file selection via file input
    fileUpload.addEventListener('change', handleFiles);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    fileUploadContainer.classList.add('border-blue-500', 'bg-blue-50');
}

function unhighlight() {
    fileUploadContainer.classList.remove('border-blue-500', 'bg-blue-50');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const files = e.target.files;
    if (files.length > 0) {
        // Update UI to show file is selected
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        const fileInfo = document.createElement('div');
        fileInfo.className = 'mt-2 text-sm text-gray-600';
        fileInfo.textContent = `Selected: ${fileNames}`;
        
        // Remove any existing file info
        const existingInfo = fileUploadContainer.querySelector('.file-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        fileInfo.classList.add('file-info');
        fileUploadContainer.appendChild(fileInfo);
    }
}

// Form Submission
if (prescriptionForm) {
    prescriptionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(prescriptionForm);
        const submitButton = prescriptionForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Processing...';
            
            // In a real app, you would send this data to your server
            // For now, we'll simulate a network request
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Appointment booked successfully! We will contact you shortly on WhatsApp.', 'success');
            
            // Reset form
            prescriptionForm.reset();
            const fileInfo = fileUploadContainer.querySelector('.file-info');
            if (fileInfo) fileInfo.remove();
            
            // In a real app, you would redirect to a success page or show a success message
            // window.location.href = '/appointment-success.html';
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('An error occurred. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 max-w-sm transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    
    // Add message
    notification.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-1 right-2 text-white hover:text-gray-200';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    notification.appendChild(closeButton);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add scroll event listener for navbar
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
    // Add any initialization code here
    
    // Example: Add animation classes to elements
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Set minimum date for appointment date picker to today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format date as YYYY-MM-DD
    const minDate = tomorrow.toISOString().split('T')[0];
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        dateInput.min = minDate + 'T09:00';
        dateInput.max = minDate + 'T18:00';
    }
});

// WhatsApp click handler
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(button => {
    button.addEventListener('click', (e) => {
        // You can add analytics or tracking here
        console.log('WhatsApp button clicked');
    });
});
