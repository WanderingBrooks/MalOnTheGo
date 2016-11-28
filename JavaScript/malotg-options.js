/**
 * Created by Jason on 11/4/2016.
 */

// Saves the users credentials in chrome local as an object called malotgData
function saveUserCredentials() {
        var username = document.getElementById("malotg-username").value;
        var password = document.getElementById("malotg-password").value;
        var data = {"username": username, "password": password};
         chrome.storage.local.set(
             {"malotgData": data},
             function() {
                 if (chrome.runtime.error) {
                     document.getElementById('malotg-update').textContent = 'Failed to save credentials';
                     setTimeout(function() {
                         document.getElementById('malotg-update').textContent = 'Input your MyAnimeList credentials';
                     }, 1000);
                 }
                 else {
                     document.getElementById('malotg-update').textContent = 'Credentials are valid and have been saved.';
                     setTimeout(function() {
                         document.getElementById('malotg-update').textContent = 'Input your MyAnimeList credentials';
                     }, 1000);
                 }});



}
// Function that turns the password input from password to txt and vise versa
function togglePassword(){
    var password = document.getElementById("malotg-password");
    if (password.type == "password") {
        password.setAttribute('type', 'text');
    }
    else {
        password.setAttribute('type', 'password');
    }
}
// Gets the current saved credentials and puts them in the username and password fields
function restoreValues() {
    chrome.storage.local.get('malotgData',
        function(result) {
            if (!chrome.runtime.error) {
                document.getElementById('malotg-username').value = result.malotgData.username;
                document.getElementById('malotg-password').value = result.malotgData.password;
            }
            else {
                document.getElementById('malotg-update').textContent = 'Failed to retrieve credentials';
                setTimeout(function() {
                    document.getElementById('malotg-update').textContent = 'Input your MyAnimeList credentials';
                }, 1000);
            }
    });

}

// Checks users credentials
function verifyCredentials() {
    var username = document.getElementById("malotg-username").value;
    var password = document.getElementById("malotg-password").value;
    $.ajax({
        "url": "https://myanimelist.net/api/account/verify_credentials.xml",
        "error": failedRequest,
        "username": username,
        "password": password,
        "success": saveUserCredentials
     });
}

// Alerts the user if the credentials are wrong
function failedRequest(textStatus) {
    document.getElementById('malotg-update').textContent = textStatus.responseText;
    setTimeout(function() {
        document.getElementById('malotg-update').textContent = 'Input your MyAnimeList credentials';
    }, 1000);
}

// Sets up the listeners
document.addEventListener('DOMContentLoaded', restoreValues);
document.getElementById('malotg-save').addEventListener('click', verifyCredentials);
document.getElementById('malotg-showhide').addEventListener('click', togglePassword);
