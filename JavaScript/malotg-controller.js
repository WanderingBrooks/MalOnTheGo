
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


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse ) {
    malanywhereController(request);
});

function malanywhereGetCredentials(callback) {
    chrome.storage.local.get('malotgData', function (result) {
        if (!chrome.runtime.error) {
            if ($.isEmptyObject(result)) {
                insertLogin();
            }
            callback(result.malotgData.username, result.malotgData.password);
        }
        else {
            chromeGetFail();
        }
    });
}

function malanywhereDeleteCredentials() {
    chrome.storage.local.clear(insertLogin);
}

// If getting the credentials from chrome.storage fails
function chromeGetFail() {
    alert("chrome.runtime.error: Failed to retrieve your credentials");
}

function malanywhereSendInfo(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, data);
    });
}

function malanywhereSaveCredentials(user, password) {
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

