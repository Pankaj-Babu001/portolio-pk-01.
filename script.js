// Smooth scrolling for anchor links: Handles smooth navigation when clicking internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        // Ensure it's not just '#' (which would cause a full page refresh)
        // Use 'anchor' directly as 'this' might be re-bound in arrow functions
        if (anchor.getAttribute('href').length > 1) {
            e.preventDefault(); // Prevent default jump behavior
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) { // Check if the target element exists
                target.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the target
            }
             // Close mobile nav menu if open after clicking a link
            const navLinksMenu = document.querySelector('.nav-links');
            const hamburger = document.getElementById('hamburger');
            if (navLinksMenu.classList.contains('active')) {
                navLinksMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// Hamburger menu toggle: Controls the mobile navigation menu's visibility
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active'); // Toggles the 'active' class on nav links
    hamburger.classList.toggle('active'); // Toggles 'active' class on hamburger for animation
});
// Note: Closing nav on link click is already handled by the smooth scroll function for valid links.

// Scroll-to-top button functionality: Shows/hides a button to scroll to the top of the page
const scrollToTopBtn = document.getElementById('scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { // Show button after scrolling down 300px
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll to the top
    });
});

// --- Gemini API Integration: Working Wage Calculator Feature ---
// Select elements for the wage calculator
const calculateWageBtn = document.getElementById('calculateWageBtn');
const hourlyRateInput = document.getElementById('hourlyRate');
const hoursWorkedInput = document.getElementById('hoursWorked');
const taxRateInput = document.getElementById('taxRate');
const wageResultDiv = document.getElementById('wage-result');

// Event listener for the calculate wage button
calculateWageBtn.addEventListener('click', async () => {
    // Parse input values as floating-point numbers
    const hourlyRate = parseFloat(hourlyRateInput.value);
    const hoursWorked = parseFloat(hoursWorkedInput.value);
    const taxRate = parseFloat(taxRateInput.value);

    // Client-side validation for input fields
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
        wageResultDiv.innerHTML = '<p style="color: #FF6347;">Please enter a valid hourly rate (e.g., 25.00).</p>';
        wageResultDiv.style.display = 'block';
        wageResultDiv.classList.remove('loading'); // Remove loading state
        return; // Stop execution if validation fails
    }
    if (isNaN(hoursWorked) || hoursWorked <= 0) {
        wageResultDiv.innerHTML = '<p style="color: #FF6347;">Please enter valid hours worked (e.g., 40).</p>';
        wageResultDiv.style.display = 'block';
        wageResultDiv.classList.remove('loading');
        return;
    }
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        // Tax rate is optional, but if entered, it must be valid
        wageResultDiv.innerHTML = '<p style="color: #FF6347;">Please enter a valid tax rate (0-100%).</p>';
        wageResultDiv.style.display = 'block';
        wageResultDiv.classList.remove('loading');
        return;
    }

    // Show loading spinner and message while AI is processing
    wageResultDiv.innerHTML = '<div class="spinner"></div><p>Calculating and generating insights...</p>';
    wageResultDiv.style.display = 'flex'; // Make the div visible
    wageResultDiv.classList.add('loading'); // Add loading class for spinner styles

    try {
        // Construct the prompt for the Gemini AI model
        const prompt = `Calculate the gross weekly wage, and net weekly wage (after tax) based on the following details for a professional backend developer:
        Hourly Rate: $${hourlyRate.toFixed(2)}
        Hours Worked per week: ${hoursWorked.toFixed(1)}
        Estimated Tax Rate: ${taxRate.toFixed(1)}%

        Provide the results clearly formatted, showing Gross Wage and Net Wage. Then, offer a brief, insightful breakdown or tip regarding financial planning, career growth, or income optimization for a backend developer. Keep the response professional, encouraging, and concise, around 3-4 sentences total, including the calculations. Ensure the final response is easy to read and understand.`;

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] }); // Add the user prompt to chat history

        const payload = { contents: chatHistory };
        const apiKey = ""; // IMPORTANT: Canvas will inject the API key at runtime. Do not hardcode.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Make the API call to the Gemini model
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check if the API response was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
        }

        const result = await response.json(); // Parse the JSON response from the API

        // Extract and display the generated text from the API response
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const insightText = result.candidates[0].content.parts[0].text;
            // Replace newline characters with HTML <br> tags for proper display
            wageResultDiv.innerHTML = `<p>${insightText.replace(/\n/g, '<br>')}</p>`;
        } else {
            // Handle cases where the API response structure is not as expected
            wageResultDiv.innerHTML = '<p style="color: #FF6347;">Could not generate wage insights. Please try again.</p>';
            console.error('Unexpected API response structure:', result);
        }
    } catch (error) {
        // Catch and display any errors during the fetch operation or API call
        wageResultDiv.innerHTML = `<p style="color: #FF6347;">Error calculating wage: ${error.message}</p>`;
        console.error('Gemini API call failed:', error);
    } finally {
        // Ensure the loading state is removed regardless of success or failure
        wageResultDiv.classList.remove('loading');
    }
});
