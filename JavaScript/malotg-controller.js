// Sends the given data to the specified chrome tab
function malotgSendInfo(data, tab) {
    chrome.tabs.get(tab.id, function () {
        chrome.tabs.sendMessage(tab.id, data);
    });
}

// Called when the user clicks on the browser action.
// Sends a request to the front end to either hide or show the ui
chrome.pageAction.onClicked.addListener(function (tab) {
    malotgSendInfo({"message": "show hide"}, tab);
});

// Enables the chrome page action
function showActionPage(tab) {
    chrome.pageAction.show(tab.id);
}

/*
 get the users credentials from chrome storage
 Returns an object with a field username and field password
 */
function getCredentials(tab, callback) {
    chrome.storage.local.get('malotgData', function (result) {
        if (!chrome.runtime.error) {
            if ($.isEmptyObject(result)) {
                malotgSendInfo({
                    "message": "set values",
                    "code": -2,
                    "values": -2
                }, tab);
            }
            callback({"username": result.malotgData.username, "password": result.malotgData.password});
        }
        //  Code -3 send chrome get failed NOT YET IMPLEMENTED
    });
}

// Deletes the users credentials from chrome storage
// Alerts the frontend that new credentials need to be acquired
function malotgDeleteCredentials(tab) {
    chrome.storage.local.clear(function () {
        malotgSendInfo({
            "message": "set values",
            "code": -2,
            "values": -2
        }, tab);
    });
}

/* Saves the given username and password to chrome.storage.local
 * Does not verify the credentials must be done prior to calling this function */
function malotgSaveCredentials(user, password, tab) {
    var data = {"username": user, "password": password};
    chrome.storage.local.set({"malotgData": data},
        function () {
            if (chrome.runtime.error) {
                malotgSendInfo({
                    "message": "information update",
                    "code": -2,
                    "text": 'Failed to save credentials'
                }, tab);
            }
            else {
                malotgSendInfo({
                    "message": "information update",
                    // This is a bogus code because the front end will get new titles if credentials have been saved
                    "code": 2,
                    "text": ' Saved Credentials'
                }, tab);
            }
        });
}

/* Converts a object to an xml tree */
/* Objects should only be mappings from strings to primitive types strings, booleans, numbers (NOT OBJECTS, OR ARRAYS, OR FUNCTION OR ...) */
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

// Adds the given info to the given users myanimelist and calls the error or success depending on MyAnimeList's response
function malAdd(data, id, username, password, error, success) {
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
// Updates the given users myanimelist with the given info ands calls the error or success depending on MyAnimeList's response
function malUpdate(data, id, username, password, error, success) {
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

// Deletes the given show from the given users MyAnimeList and calls success or error depending on the servers response
function malDelete(id, username, password, error, success) {
    $.ajax({
        "url": " https://myanimelist.net/api/animelist/delete/" + id + ".xml",
        "type": "POST",
        "success": success,
        "error": error,
        "username": username,
        "password": password
    });
}

// Listener for the backend looks for requests from the front end then delegates the request
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    showActionPage(sender.tab);
    if (request.message === "save credentials") {
        // Verify the credentials before saving them
        MALAnywhere.verifyCredentials(request.username, request.password,
            function (jqXHR, textStatus, errorThrown) {
                // If there not send the message from the server to the front end
                malotgSendInfo({
                    "message": "information update",
                    "code": 2,
                    "text": jqXHR.responseText
                }, sender.tab)
            },
            // If the credentials are valid save them
            function (data, textStatus, jqXHR) {
                malotgSaveCredentials(request.username, request.password, sender.tab);
            });
    }
    else if (request.message === "delete credentials") {
        malotgDeleteCredentials(sender.tab);
    }
    else if (request.message === "get info") {
        // Retrieve the users credentials from chrome.local.storage
        getCredentials(sender.tab, function (credentials) {
            // Get user values from the api
            MALAnywhere.getAnimeInfo(request.titles, credentials.username, credentials.password,
                function (anime) {
                    // The show was found on MAL and the user has values stored for it already
                    // Send to the front end to be displayed
                    if (anime.code === MALAnywhere.CODES.FOUND_AND_ON_USER_LIST) {
                        malotgSendInfo({
                            "message": "set values",
                            "code": MALAnywhere.CODES.FOUND_AND_ON_USER_LIST,
                            "values": {
                                "series_title": anime.animeInfo.matched_title,
                                "my_status": anime.userValues.status,
                                "my_score": anime.userValues.score,
                                "series_episodes": anime.animeInfo.episodes,
                                "my_watched_episodes": anime.userValues.watched_episodes,
                                "my_start_date": anime.userValues.start_date,
                                "my_finish_date": anime.userValues.finish_date,
                                "my_tags": anime.userValues.tags,
                                "series_animedb_id": anime.animeInfo.id,
                                "user": credentials.username,
                                "password": credentials.password
                            }
                        }, sender.tab)
                    }
                    // The show is on MAL but the user does not have nay info sored for it
                    // Send to the front end for displaying
                    else if (anime.code === MALAnywhere.CODES.FOUND_BUT_NOT_ON_USER_LIST) {
                        malotgSendInfo({
                            "message": "set values",
                            "code": MALAnywhere.CODES.FOUND_BUT_NOT_ON_USER_LIST,
                            "values": {
                                "series_title": anime.animeInfo.matched_title,
                                "my_status": "1",
                                "my_score": "0",
                                "series_episodes": anime.animeInfo.episodes,
                                "my_watched_episodes": "0",
                                "my_start_date": "",
                                "my_finish_date": "",
                                "my_tags": "",
                                "series_animedb_id": anime.animeInfo.id,
                                "user": credentials.username,
                                "password": credentials.password
                            }
                        }, sender.tab)
                    }
                    // The given titles didn't match any show on MAL
                    // Display the info in the front end
                    else if (anime.code === MALAnywhere.CODES.NO_SEARCH_RESULTS) {
                        malotgSendInfo({
                            "message": "set values",
                            "code": MALAnywhere.CODES.NO_SEARCH_RESULTS,
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
                            },
                            "title": "Anime not found"
                        }, sender.tab);
                    }
                    else if (anime.code === MALAnywhere.CODES.AJAX_ERROR) {
                        malotgSendInfo({
                            "message": "set values",
                            "code": -MALAnywhere.CODES.NO_SEARCH_RESULTS,
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
                            },
                            "title": anime.jqXHR.responseText
                        });

                    }
                });
        });
    }
    else if (request.message === "add") {
        // Get credentials from chrome.local.storage
        getCredentials(sender.tab, function(credentials) {
            // Add the given show to the users mal list
           malAdd(request.data, request.id, credentials.username, credentials.password,
               // inform the user that something went wrong when trying to add the info to mal
               function (jqXHR, textStatus, errorThrown) {
                   malotgSendInfo({
                       "message": "information update",
                       "code": 1,
                       "text": jqXHR.responseText,
                       "advancedOptions": request.advancedOptions,
                       "id": request.id
                   }, sender.tab)
               },
               // tell the user the info was added successfully
               function (data, textStatus, jqXHR) {
                   malotgSendInfo({
                       "message": "information update",
                       "code": 1,
                       "text": jqXHR.responseText,
                       "advancedOptions": request.advancedOptions,
                       "id": request.id
                   }, sender.tab);
               });
        });
    }
    else if (request.message === "update") {
        // get credentials from chrome.local.storage
        getCredentials(sender.tab, function(credentials) {
            // Update the values already stored on mal with the ones sent by the front end
            malUpdate(request.data, request.id, credentials.username, credentials.password,
                // inform the user something went wrong trying to update the values
                function (jqXHR, textStatus, errorThrown) {
                    malotgSendInfo({
                        "message": "information update",
                        "code": 1,
                        "text": jqXHR.responseText,
                        "advancedOptions": request.advancedOptions,
                        "id": request.id
                    }, sender.tab)
                },
                // alert the user the values were updated successfully
                function (data, textStatus, jqXHR) {
                    malotgSendInfo({
                        "message": "information update",
                        "code": 1,
                        "text": jqXHR.responseText,
                        "advancedOptions": request.advancedOptions,
                        "id": request.id
                    }, sender.tab);
                });
        });
    }
    else if (request.message === "delete") {
        // Get the credential from chrome.local.storage
        getCredentials(sender.tab, function(credentials) {
            // Delete the given values from the suers mal
            malDelete(request.data, credentials.username, credentials.password,
                // something went wrong trying to delete
                function (jqXHR, textStatus, errorThrown) {
                    malotgSendInfo({
                        "message": "information update",
                        "code": 0,
                        "text": jqXHR.responseText
                    }, sender.tab)
                },
                // Successful deletion
                function (data, textStatus, jqXHR) {
                    malotgSendInfo({
                        "message": "information update",
                        "code": 0,
                        "text": jqXHR.responseText
                    }, sender.tab);
                });
        });
    }
});

