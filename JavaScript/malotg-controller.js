
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
       malanywhereSendInfo({"message": "show hide"});
        chrome.browserAction.getTitle({}, function (title) {
            if (title === "Hide MalOTG") {
                chrome.browserAction.setTitle({"title": "Show MalOTG"})
            }
            else if (title === "Show MalOTG") {
                chrome.browserAction.setTitle({"title": "Hide MalOTG"})
            }
        });
});

// Listener for the backend looks for requests from the front end then delegates the message to the backend
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse ) {
    malanywhereController(request);
});
// get the users credentials then calls the call back passing the username and password as parameters
function malanywhereGetCredentials(callback, request) {
    chrome.storage.local.get('malotgData', function (result) {
        if (!chrome.runtime.error) {
            if ($.isEmptyObject(result)) {
                malanywhereController({"message": "send login", "url": request.url});
            }
            callback(result.malotgData.username, result.malotgData.password);
        }
        else {
            chromeGetFail();
        }
    });
}
// Deletes the users credentials
function malanywhereDeleteCredentials(request) {
    chrome.storage.local.clear(function() {
        malanywhereController({"message": "send login", "url": request.url})
    });
}

// If getting the credentials from chrome.storage fails
function chromeGetFail() {
    alert("chrome.runtime.error: Failed to retrieve your credentials");
}

// Sends the given data to the tab or tabs that are on the same page
function malanywhereSendInfo(data, request) {
    chrome.tabs.query({"url": request.url}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, data);
        }

    });
}

/* Saves the given username and password */
function malanywhereSaveCredentials(user, password, request) {
    function saveCredentials() {
        var data = {"username": user, "password": password};
        chrome.storage.local.set({"malotgData": data},
            function() {
                if (chrome.runtime.error) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": -2,
                        "text": 'Failed to save credentials'}
                        )
                }
                else {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": -1,
                        "text": ' Saved Credentials'
                    });
                }

            });
    }
    return saveCredentials;
}

