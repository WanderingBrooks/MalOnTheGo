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

// Gets the text from the xhr and sends it to be displayed at the front end
function getInfo(data, textStatus, jqXHR) {
    malanywhereSendInfo({
        "message": "information update",
        "code": 2,
        "text": jqXHR.responseText
    }, request);
}

// Listener for the backend looks for requests from the front end then delegates the message to the backend
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "save credentials") {
        malanywhereVerifyCredentials(request.username, request.password,
            function (jqXHR, textStatus, errorThrown) {
                malanywhereSendInfo({
                    "message": "information update",
                    "code": 2,
                    "text": jqXHR.responseText + " " + textStatus
                }, sender.tab)
            },
            function (data, textStatus, jqXHR) {
                malanywhereSaveCredentials(request.username, request.password, sender.tab);
            });
    }
    else if (request.message === "delete credentials") {
        malanywhereDeleteCredentials();
    }
    else if (request.message === "get info") {
        getCredentials(sender.tab, function (credentials) {
            malanywhereGetInfo(request.titles, credentials.username, credentials.password,
                function (anime) {
                    if (anime.code === 1) {
                        malanywhereSendInfo({
                            "message": "set values",
                            "code": 1,
                            "values": {
                                "series_title": anime.searchResults.find("title").text(),
                                "my_status": anime.userValues.find("my_status").text(),
                                "my_score": anime.userValues.find("my_score").text(),
                                "series_episodes": anime.userValues.find("series_episodes").text(),
                                "my_watched_episodes": anime.userValues.find("my_watched_episodes").text(),
                                "my_start_date": anime.userValues.find("my_start_date").text(),
                                "my_finish_date": anime.userValues.find("my_finish_date").text(),
                                "my_tags": anime.userValues.find("my_tags").text(),
                                "series_animedb_id": anime.searchResults.find("id").text(),
                                "user": credentials.username,
                                "password": credentials.password
                            }
                        }, sender.tab)
                    }
                    else if (anime.code === 0) {
                        malanywhereSendInfo({
                            "message": "set values",
                            "code": 0,
                            "values": {
                                "series_title": anime.searchResults.find("title").text(),
                                "my_status": "1",
                                "my_score": "0",
                                "series_episodes": anime.searchResults.find("episodes").text(),
                                "my_watched_episodes": "0",
                                "my_start_date": "",
                                "my_finish_date": "",
                                "my_tags": "",
                                "series_animedb_id": anime.searchResults.find("id").text(),
                                "user": credentials.username,
                                "password": credentials.password
                            }
                        }, sender.tab)
                    }
                    else if (anime.code === -1) {
                        malanywhereSendInfo({
                            "message": "set values",
                            "code": -1,
                            "values": {
                                "series_title": "",
                                "my_status": "",
                                "my_score": "",
                                "series_episodes": "",
                                "my_watched_episodes": "",
                                "my_start_date": "",
                                "my_finish_date": "",
                                "my_tags": "",
                                "series_animedb_id": "",
                                "user": credentials.username,
                                "password": credentials.password
                            }
                        }, sender.tab);
                    }
                });
        });
    }
});
/* get the users credentials
 Returns an object with a username and password field
 */
function getCredentials(tab, callback) {
    chrome.storage.local.get('malotgData', function (result) {
        if (!chrome.runtime.error) {
            if ($.isEmptyObject(result)) {
                malanywhereSendInfo({
                    "message": "set values",
                    "code": -2,
                    "values": -2
                }, tab);
            }
            callback({"username": result.malotgData.username, "password": result.malotgData.password});
        }
        else {
            chromeGetFail();
        }
    });
}

// Deletes the users credentials
function malanywhereDeleteCredentials(tab) {
    chrome.storage.local.clear(function () {
        malanywhereSendInfo({
            "message": "set values",
            "code": -2,
            "values": -2
        }, tab)
    });
}

// If getting the credentials from chrome.storage fails
function chromeGetFail() {
    alert("chrome.runtime.error: Failed to retrieve your credentials");
}

// Sends the given data to the tab or tabs that are on the same page
function malanywhereSendInfo(data, tab) {
    chrome.tabs.get(tab.id, function () {
        chrome.tabs.sendMessage(tab.id, data);
    });
}

/* Saves the given username and password */
function malanywhereSaveCredentials(user, password, tab) {
    function saveCredentials() {
        var data = {"username": user, "password": password};
        chrome.storage.local.set({"malotgData": data},
            function () {
                if (chrome.runtime.error) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": -2,
                        "text": 'Failed to save credentials'
                    }, tab);
                }
                else {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": -1,
                        "text": ' Saved Credentials'
                    }, tab);
                }

            });
    }

    return saveCredentials;
}

function malAdd(xmlValues, username, password) {

}

function malUpdate(xmlValues, username, password) {

}

function malDelete(id, username, password) {

}
