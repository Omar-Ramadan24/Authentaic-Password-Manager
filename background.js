// Function to save a password entry
function savePassword(data, callback) {
    chrome.storage.local.get({ passwords: [] }, (result) => {
        const passwords = result.passwords; // Retrieve the current list of passwords
        const newEntry = {
            site: data.site,
            login: data.login,
            password: data.password,
            comment: data.comment,
            creationDate: new Date().toISOString(), // Store the creation date
        };
        passwords.push(newEntry); // Add the new entry to the list
        chrome.storage.local.set({ passwords }, () => {
            callback({ success: true, message: "Password saved!" }); // Notify that the save was successful
        });
    });
}

// Function to retrieve all saved passwords
function getPasswords(callback) {
    chrome.storage.local.get({ passwords: [] }, (result) => {
        callback(result.passwords); // Return the list of passwords
    });
}

// Function to delete a password by its index
function deletePassword(index, callback) {
    chrome.storage.local.get({ passwords: [] }, (result) => {
        const passwords = result.passwords; // Retrieve the current list of passwords
        if (index >= 0 && index < passwords.length) {
            passwords.splice(index, 1); // Remove the password at the given index
            chrome.storage.local.set({ passwords }, () => {
                callback({ success: true, message: "Password deleted successfully!" }); // Notify success
            });
        } else {
            callback({ success: false, message: "Invalid password index!" }); // Notify failure
        }
    });
}

// Listener for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "savePassword") {
        savePassword(request.data, sendResponse);
    } else if (request.action === "getPasswords") {
        getPasswords(sendResponse);
    } else if (request.action === "deletePassword") {
        deletePassword(request.index, sendResponse);
    }
    return true; 
});
