// Called when the user clicks on the browser action.
chrome.pageAction.onClicked.addListener(function (tab) {
    malanywhereSendInfo({"message": "show hide"}, tab);
    chrome.pageAction.getTitle({"tabId": tab.id}, function (title) {
        if (title === "Hide MalOTG") {
            chrome.pageAction.setTitle({"title": "Show MalOTG"})
        }
        else if (title === "Show MalOTG") {
            chrome.pageAction.setTitle({"title": "Hide MalOTG"})
        }
    });
});

// Gets the text from the xhr and sends it to be displayed at the front end
function getInfo(data, textStatus, jqXHR) {
    malanywhereSendInfo({
        "message": "information update",
        "code": 2,
        "text": jqXHR.responseText
    });
}

function showActionPage(tab) {
    chrome.pageAction.show(tab.id);
}

// Listener for the backend looks for requests from the front end then delegates the message to the backend
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    showActionPage(sender.tab);
    if (request.message === "save credentials") {
        malanywhereVerifyCredentials(request.username, request.password,
            function (jqXHR, textStatus, errorThrown) {
                malanywhereSendInfo({
                    "message": "information update",
                    "code": 2,
                    "text": jqXHR.responseText
                }, sender.tab)
            },
            function (data, textStatus, jqXHR) {
                malanywhereSaveCredentials(request.username, request.password, sender.tab);
            });
    }
    else if (request.message === "delete credentials") {
        malanywhereDeleteCredentials(sender.tab);
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
    else if (request.message === "add") {
        getCredentials(sender.tab, function(credentials) {
           malAdd(request.data, request.id, credentials.username, credentials.password, sender.tab,
               function (jqXHR, textStatus, errorThrown) {
                   malanywhereSendInfo({
                       "message": "information update",
                       "code": 2,
                       "text": jqXHR.responseText,
                       "advancedOptions": request.advancedOptions,
                       "id": request.id
                   }, sender.tab)
               },
               function (data, textStatus, jqXHR) {
                   malanywhereSendInfo({
                       "message": "information update",
                       "code": 2,
                       "text": jqXHR.responseText,
                       "advancedOptions": request.advancedOptions,
                       "id": request.id
                   }, sender.tab);
               });
        });
    }
    else if (request.message === "update") {
        getCredentials(sender.tab, function(credentials) {
            malUpdate(request.data, request.id, credentials.username, credentials.password, sender.tab,
                function (jqXHR, textStatus, errorThrown) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": 2,
                        "text": jqXHR.responseText,
                        "advancedOptions": request.advancedOptions,
                        "id": request.id
                    }, sender.tab)
                },
                function (data, textStatus, jqXHR) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": 2,
                        "text": jqXHR.responseText,
                        "advancedOptions": request.advancedOptions,
                        "id": request.id
                    }, sender.tab);
                });
        });
    }
    else if (request.message === "delete") {
        getCredentials(sender.tab, function(credentials) {
            malDelete(request.data, credentials.username, credentials.password, sender.tab,
                function (jqXHR, textStatus, errorThrown) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": 2,
                        "text": jqXHR.responseText
                    }, sender.tab)
                },
                function (data, textStatus, jqXHR) {
                    malanywhereSendInfo({
                        "message": "information update",
                        "code": 2,
                        "text": jqXHR.responseText
                    }, sender.tab);
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
        }, tab);
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

function malAdd(data, id, username, password, tab, error, success) {
    // Creates an xml representation of the object based on the mal api standard
    var xml = objectToXML(data, "entry");
    var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + new XMLSerializer().serializeToString(xml);
    $.ajax({
        "url": " https://myanimelist.net/api/animelist/add/" + id + ".xml",
        "type": "POST",
        "data": {"data": xmlString},
        "success": success,
        "error": error,
        "username": username,
        "password": password
    });
}

function malUpdate(data, id, username, password, tab, error, success) {
    // Creates an xml representation of the object based on the mal api standard
    var xml = objectToXML(data, "entry");
    var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + new XMLSerializer().serializeToString(xml);
    $.ajax({
        "url": " https://myanimelist.net/api/animelist/update/" + id + ".xml",
        "type": "POST",
        "data": {"data": xmlString},
        "success": success,
        "error": error,
        "username": username,
        "password": password
    });
}

function malDelete(id, username, password, tab, error, success) {
    $.ajax({
        "url": " https://myanimelist.net/api/animelist/delete/" + id + ".xml",
        "type": "POST",
        "success": success,
        "error": error,
        "username": username,
        "password": password
    });
}

/* Converts a object to an xml tree */
/* Objects should only be mappings from strings to primitive types strings, booleans, numbers (NOT OBJECTS, OR ARRAYS, OR FUNCTION or ...) */
function objectToXML(object, rootName) {
    var xmlDoc = document.implementation.createDocument("", rootName, null);
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {

        var key = keys[i];
        var value = object[key];

        var xmlNode = xmlDoc.createElement(key);
        xmlDoc.documentElement.appendChild(xmlNode);
        xmlNode.appendChild(xmlDoc.createTextNode(value));
    }
    return xmlDoc;
}
