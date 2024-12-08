// Event listener for saving a new password
document.getElementById('save-password').addEventListener('click', () => {
    const site = document.getElementById('site').value; // Get the site input
    const login = document.getElementById('login').value; // Get the login input
    const password = document.getElementById('password').value; // Get the password input
    const comment = document.getElementById('comment').value; // Get the comment input

    // Check if all required fields are filled
    if (!site || !login || !password) {
        alert('Please fill in all required fields.');
        return;
    }

    // Create an object representing the password entry
    const newEntry = { site, login, password, comment };

    // Send the new entry to the background script to save
    chrome.runtime.sendMessage(
        { action: "savePassword", data: newEntry },
        (response) => {
            if (response.success) {
                alert(response.message); // Notify the user that the password was saved
                loadPasswords(); // Refresh the password list to include the new entry
            } else {
                alert("Error saving password."); // Notify the user of an error
            }
        }
    );

    // Clear the input fields after saving
    document.getElementById('site').value = '';
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    document.getElementById('comment').value = '';
});

// Function to load and display all saved passwords
function loadPasswords() {
    // Request the saved passwords from the background script
    chrome.runtime.sendMessage({ action: "getPasswords" }, (passwords) => {
        const tbody = document.getElementById('passwords-tbody'); // Get the table body element
        tbody.innerHTML = ''; // Clear the existing rows

        // Loop through the passwords and create rows for each
        passwords.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.site}</td>
                <td>${entry.login}</td>
                <td>${entry.password}</td>
                <td>${entry.comment || ''}</td>
                <td>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
                <td>
                    <button class="copy-btn" data-type="login" data-value="${entry.login}">Copy Login</button>
                    <button class="copy-btn" data-type="password" data-value="${entry.password}">Copy Password</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners to delete buttons
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index'); // Get the index to delete
                deletePassword(index);
            });
        });

        // Add event listeners to copy buttons
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const value = event.target.getAttribute('data-value'); // Get the value to copy
                copyToClipboard(value); // Copy it to the clipboard
                alert(`${event.target.getAttribute('data-type')} copied to clipboard!`); // Notify the user
            });
        });
    });
}

// Function to copy text to the clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea'); // Create a temporary textarea element
    textarea.value = text; // Set its value to the text to copy
    document.body.appendChild(textarea); // Add it to the document
    textarea.select(); // Select the text
    document.execCommand('copy'); // Copy the text to clipboard
    document.body.removeChild(textarea); // Remove the temporary element
}

// Event listener for checking password strength
document.getElementById('password').addEventListener('input', (event) => {
    const password = event.target.value; // Get the inputted password
    const feedback = analyzePasswordStrength(password); // Analyze the password strength
    updateStrengthMeter(feedback); // Update the strength meter
});

// Function to analyze password strength
function analyzePasswordStrength(password) {
    let score = 0;
    const feedback = { strength: '', color: '', message: '' };

    // Evaluate password based on criteria
    if (password.length >= 8) score++; // At least 8 characters
    if (/[A-Z]/.test(password)) score++; // Contains uppercase letters
    if (/[a-z]/.test(password)) score++; // Contains lowercase letters
    if (/[0-9]/.test(password)) score++; // Contains numbers
    if (/[\W_]/.test(password)) score++; // Contains special characters

    // Assign strength levels based on the score
    if (score <= 1) {
        feedback.strength = 'Weak';
        feedback.color = 'red';
        feedback.message = 'Try adding uppercase letters, numbers, or special characters.';
    } else if (score <= 3) {
        feedback.strength = 'Medium';
        feedback.color = 'orange';
        feedback.message = 'A longer password with mixed characters is stronger.';
    } else {
        feedback.strength = 'Strong';
        feedback.color = 'green';
        feedback.message = 'Your password is strong!';
    }

    return feedback;
}

// Function to update the strength meter and feedback
function updateStrengthMeter(feedback) {
    const strengthBar = document.getElementById('strength-bar'); // Get the strength bar element
    const strengthFeedback = document.getElementById('strength-feedback'); // Get the feedback element

    // Update the strength bar's width and color
    strengthBar.style.width = feedback.strength === 'Weak' ? '33%' : feedback.strength === 'Medium' ? '66%' : '100%';
    strengthBar.style.backgroundColor = feedback.color;

    // Update the feedback message
    strengthFeedback.textContent = feedback.message;
    strengthFeedback.style.color = feedback.color;
}

// Function to delete a password
function deletePassword(index) {
    // Send a request to the background script to delete the password
    chrome.runtime.sendMessage(
        { action: "deletePassword", index: parseInt(index) },
        (response) => {
            if (response.success) {
                alert(response.message); // Notify the user
                loadPasswords(); // Reload the updated password list
            } else {
                alert(response.message); // Notify the user of an error
            }
        }
    );
}

// Load passwords when the popup is opened
document.addEventListener('DOMContentLoaded', loadPasswords);
