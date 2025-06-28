// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Check if the href is not just '#' (which would cause a full page refresh)
        if (anchor.getAttribute('href').length > 1) {
            e.preventDefault();
            document.querySelector(anchor.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile nav menu if open after click
            const navLinksMenu = document.querySelector('.nav-links');
            const hamburger = document.getElementById('hamburger');
            if (navLinksMenu.classList.contains('active')) {
                navLinksMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const headerHeight = document.querySelector('header').offsetHeight; // Get header height dynamically

window.addEventListener('scroll', () => {
    let current = '';
    // Adjust offset to account for fixed header
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 1; // Subtract header height and a small buffer
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });

    // Show/hide scroll-to-top button
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (window.pageYOffset > 300) { // Show button after scrolling 300px
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

// Scroll-to-top button functionality
document.getElementById('scroll-to-top').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


// Hamburger menu toggle
const hamburger = document.getElementById('hamburger');
const navLinksMenu = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinksMenu.classList.toggle('active');
    hamburger.classList.toggle('active'); // Toggle hamburger animation class
});
// Close menu on link click (mobile) - already handled in general smooth scroll

// Fade-in animation on scroll
const faders = document.querySelectorAll('section, .project-card, .skill-item, .contact-item, .stat');
const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }; // Added rootMargin for better trigger

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    fader.classList.add('fade-in-init'); // Add a class to hide initially
    appearOnScroll.observe(fader);
});

// Add CSS for fade-in-init - dynamically injects CSS rules (consider moving to style.css for cleaner separation)
// For this example, I'm keeping it here as it was in the original monolithic block.
// In a real project, these should be in style.css.
const styleSheet = document.styleSheets[0]; // Gets the first stylesheet linked in the document

// Check if rules already exist to prevent duplicates if script runs multiple times
let fadeInInitRuleExists = false;
let fadeInRuleExists = false;
for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].cssText.includes('.fade-in-init')) {
        fadeInInitRuleExists = true;
    }
    if (styleSheet.cssRules[i].cssText.includes('.fade-in')) {
        fadeInRuleExists = true;
    }
}

if (!fadeInInitRuleExists) {
    styleSheet.insertRule(`
        .fade-in-init {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
    `, styleSheet.cssRules.length);
}

if (!fadeInRuleExists) {
    styleSheet.insertRule(`
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `, styleSheet.cssRules.length);
}


// Contact Form Submission (Client-Side)
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contact-status');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Simple client-side validation
    if (name === '' || email === '' || message === '') {
        showContactStatus('Please fill in all fields.', 'error');
        return;
    }

    // Simulate sending data (in a real app, you'd send this to a backend server)
    console.log('Form Submitted:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);

    // Simulate a successful submission
    setTimeout(() => {
        showContactStatus('Your message has been sent successfully!', 'success');
        contactForm.reset(); // Clear the form
    }, 1000); // Simulate network delay
});

function showContactStatus(message, type) {
    contactStatus.textContent = message;
    contactStatus.className = ''; // Clear previous classes
    contactStatus.classList.add(type);
    contactStatus.style.display = 'block';
    contactStatus.style.opacity = '1';

    // Hide the message after a few seconds
    setTimeout(() => {
        contactStatus.style.opacity = '0';
        contactStatus.addEventListener('transitionend', function() {
            contactStatus.style.display = 'none';
        }, { once: true }); // Ensure listener runs only once
    }, 5000);
}

// --- Gemini API Integration: Project Description Enhancer ---
const aiModal = document.getElementById('aiDescriptionModal');
const aiModalCloseBtn = document.querySelector('.ai-modal-close-btn');
const aiDescriptionText = document.getElementById('aiDescriptionText');
const aiDescriptionLoader = document.getElementById('aiDescriptionLoader');
const projectAiButtons = document.querySelectorAll('.project-ai-button');

// Function to show the AI modal with loading state
function showAiModal(title) {
    aiModal.classList.add('show');
    aiModalCloseBtn.style.display = 'block'; // Ensure close button is visible
    aiDescriptionLoader.style.display = 'flex'; // Show loader
    aiDescriptionText.textContent = ''; // Clear previous text
    document.querySelector('.ai-modal-title').textContent = `Enhanced Description for: ${title}`;
}

// Function to hide the AI modal
function hideAiModal() {
    aiModal.classList.remove('show');
    aiDescriptionLoader.style.display = 'none'; // Hide loader
    aiDescriptionText.textContent = ''; // Clear text
}

// Event listener for closing the modal
aiModalCloseBtn.addEventListener('click', hideAiModal);
window.addEventListener('click', (event) => {
    if (event.target == aiModal) {
        hideAiModal();
    }
});

// Attach click listeners to all "Enhance Description" buttons
projectAiButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const projectTitle = button.dataset.projectTitle;
        const projectDesc = button.dataset.projectDesc;

        showAiModal(projectTitle);

        try {
            const prompt = `You are a professional portfolio content writer. Enhance the following project description for a developer's portfolio. Make it more engaging, slightly longer (2-3 sentences), and highlight key benefits or challenges overcome, while keeping it concise and professional. Do not add headings or bullet points.

Project Title: ${projectTitle}
Current Description: ${projectDesc}

Enhanced Description:`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = { contents: chatHistory };
            const apiKey = ""; // Canvas will provide this key at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.error.message}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const enhancedText = result.candidates[0].content.parts[0].text;
                aiDescriptionText.textContent = enhancedText;
            } else {
                aiDescriptionText.textContent = 'Could not generate an enhanced description. Please try again.';
                console.error('Unexpected API response structure:', result);
            }
        } catch (error) {
            aiDescriptionText.textContent = `Error generating description: ${error.message}`;
            console.error('Gemini API call failed:', error);
        } finally {
            aiDescriptionLoader.style.display = 'none'; // Hide loader regardless of success/failure
        }
    });
});
