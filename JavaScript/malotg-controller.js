/**
 * Created by Jason on 11/4/2016.
 */

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
});

// Called when the content script finds the required fields for the website
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "get info") {
            var titles = [];
            var keys =  Object.keys(request.data);
            var key;
            for (var i = 0; i <  keys.length; i++) {
                key = keys[i];
                titles.push(request.data[key]);
            }
            searchAndFindShow(titles);
        }
        /*Ajax post to add a new anime to a users list */
        else if (request.message === "add") {
            getCredentialsAndSend(request.message, request.data, request.id);
        }
        /* Ajax post to update an anime currently in a users list */
        else if (request.message === "update") {
            getCredentialsAndSend(request.message, request.data, request.id);
        }
        /* Ajax post to delete an anime in a users list */
        else if (request.message === "delete") {
            getCredentialsAndSend(request.message, request.data, request.id);
        }
    }
);
/* Converts a object to an xml tree */
/* Objects should only be mappings from strings to primitive types strings, booleans, numbers (NOT OBJECTS, OR ARRAYS, OR FUNCTION or ...) */
function objectToXML(object, rootName) {
    var xmlDoc = document.implementation.createDocument("", rootName, null);
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {

        var key = keys[i];
        var value = object[key];

        var xmlNode = xmlDoc.createElement(key);
        xmlDoc.documentElement. appendChild(xmlNode);
        xmlNode.appendChild(xmlDoc.createTextNode(value));
    }
    return xmlDoc;
}

/*Tells the user to email me because a post went wrong */
function postToMalFail(jqXHR, textStatus, errorThrown) {
    sendInfo("Posting the data failed pleas email cs.jasonbrooks@gmail.com ");
}
// Tells the user to email me because something went wrong
function userFail() {
    alert("An error occurred getting your user values please email cs.jasonbrooks@gmail.com");
}

// Scope so the callback function has access to the given id, title and episodes
function findAnimeCreator(id, title, episodes) {

    function findAnime(data) {
        var $data = $(data);
        var $animeID = {"text": function(){return -1;}};
        // Checks all the ids in the user values matching it against what our search of the Mal database returned
        $data.find("series_animedb_id:contains(" + id + ")").filter(
            function() {
                if ($( this ).text() === id) {
                    $animeID = $( this );
                }
            });

        // If the id has been found send the pertinent information to be displayed
        if ($animeID.text() != -1) {
            var $anime = $animeID.parent();
            var $my_start_date = formatDate($anime.find("my_start_date").text());
            var $my_finish_date = formatDate($anime.find("my_finish_date").text());
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {
                    "message": "set_status",
                    "code": 0,
                    "values": {
                        "series_title": title,
                        "my_status": $anime.find("my_status").text(),
                        "my_score": $anime.find("my_score").text(),
                        "series_episodes": $anime.find("series_episodes").text(),
                        "my_watched_episodes": $anime.find("my_watched_episodes").text(),
                        "my_start_date": $my_start_date,
                        "my_finish_date": $my_finish_date,
                        "series_animedb_id": id
                    }});
            });
        }
        // If it wasn't found in the users list send the information we have to be displayed allows updating
        else {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, {"message": "set_status", "code": -1, "values": {
                    "series_title": title,
                    "series_episodes": episodes,
                    "series_animedb_id": id
                } });
            });
        }
    }

    return findAnime;
}

/* Formats the My anime list formatted date to human readable version
* Input is text not a JQUERY object*/
function formatDate(date) {
    if (date === '0000-00-00') {
        return '';
    }
    else  {
        return date.substring(5, 7) + "/" + date.substring(8) + "/" + date.substring(0, 4);
    }
}
// If the anime was not found in the Mal database send an error to be displayed to the user
function insertError() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "set_status", "code": -2, "values": 0 });
    });
}
// If getting the credentials from chrome.storage fails
function chromeGetFail() {
    alert("chrome.runtime.error: Failed to retrieve your credentials");
}
// Scope created so the search algorithm can compare the Mal stored titles to what was given from the website
function searchAndFindShow(titles) {

    function malSearch() {
        var user = "";
        var password = "";
        chrome.storage.local.get('malotgData',
            function (result) {
                if (!chrome.runtime.error) {
                    if ($.isEmptyObject(result)) {
                        alert("Please sign in a new tab has been opened with the login page");
                        chrome.runtime.openOptionsPage();
                    }
                    user = result.malotgData.username;
                    password = result.malotgData.password;
                    // Do a search for every title given to maximize the chance of getting a hit
                    for (var i = 0; i < titles.length; i++) {
                        $.ajax({
                            "url": "https://myanimelist.net/api/anime/search.xml",
                            "data": {"q": titles[i]},
                            "success": determineShow,
                            "dataType": "xml",
                            "async": false,
                            "username": user,
                            "password": password
                        })
                    }
                }
                else {
                    chromeGetFail();
                }
            });

    }
    // Initializes the values for how many ajaxes should return how many have returned and the data returned by them
    var expectedCount= titles.length;
    var activeCount = 0;
    var results = [];


function determineShow(data) {
            // Add xml for each ajax to list
            results.push(data);
            activeCount++;
            // Once all of the ajaxes have returned
            if (activeCount == expectedCount) {

                if (results.length === titles.length) {

                    var $animeID = -1;
                    var $animeTitle = "";
                    var $animeEpisodes = 0;
                    // Iterates through all each search result
                    for (var i = 0; i < results.length; i++) {
                        var $entries = $(results[i]).find("entry");
                        for (var j = 0; j < $entries.length; j++) {
                            // Iterates through each entry in each result
                            $entries.each(function () {
                                if ($(this).find("title").text().toLowerCase() == titles[i].toLowerCase()) {
                                    $animeID = $(this).find("id").text();
                                    $animeTitle = $(this).find("title").text();
                                    $animeEpisodes = $(this).find("episodes").text();
                                    i = results.length;
                                    j = $entries.length;
                                    return false
                                }
                                else if ($(this).find("english").text().toLowerCase() == titles[i].toLowerCase()) {
                                    $animeID = $(this).find("id").text();
                                    $animeTitle = $(this).find("english").text();
                                    $animeEpisodes = $(this).find("episodes").text();
                                    i = results.length;
                                    j = $entries.length;
                                    return false
                                }
                                else {

                                    var $synonyms = $(this).find("synonyms").text().split(", ");
                                    
                                    for (var k = 0; k < $synonyms.length; k++) {
                                        if ($synonyms[k].toLowerCase() == titles[i].toLowerCase()) {
                                            $animeID = $(this).find("id").text();
                                            $animeTitle = $synonyms[k];
                                            $animeEpisodes = $(this).find("episodes").text();
                                            i = results.length;
                                            j = $entries.length;
                                            break;
                                        }

                                    }
                                }
                            });
                        }
                    }
                    // If we got a hit
                    if ($animeID != -1) {
                        getCredentialsAndSend("user values", {"title": $animeTitle, "episodes": $animeEpisodes}, $animeID);
                    }
                    // If we did not
                    else {
                        insertError();
                    }
                    // Reset the variables in case the user refreshes the page
                    activeCount = 0;
                    results = [];


                }
                // If something goes wrong with initialization
                else {
                    alert("Wrong number of titles or data error in determineShow");
                }

            }
    }
    malSearch();
}

// Grouping of Ajaxes makes them call back functions for help with asynchronous programming
function getCredentialsAndSend(mode, data, id) {
    var user;
    var password;
    chrome.storage.local.get('malotgData',
        function (result) {
            if (!chrome.runtime.error) {
                user = result.malotgData.username;
                password = result.malotgData.password;
                sendRequest(mode, data, id, user, password);
            }
            else {
                alert("chrome.runtime.error: Failed to retrieve your credentials");
            }
        });

}

// Function that contains all the ajaxes differentiate between them with the variable mode
function sendRequest(mode, data, id,  user, password) {
    if (mode == "add") {
        var xml = objectToXML(data, "entry");
        var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + new XMLSerializer().serializeToString(xml);
        $.ajax({
            "url": " https://myanimelist.net/api/animelist/add/" + id + ".xml",
            "type": "POST",
            "data": {"data": xmlString},
            "success": alertHappen,
            "error": postToMalFail,
            "username": user,
            "password": password
        });
    }
    else if (mode == "update") {
        var xml = objectToXML(data, "entry");
        var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + new XMLSerializer().serializeToString(xml);
        $.ajax({
            "url": " https://myanimelist.net/api/animelist/update/" + id + ".xml",
            "type": "POST",
            "data": {"data": xmlString},
            "success": alertHappen,
            "error": postToMalFail,
            "username": user,
            "password": password
        });
    }
    else if (mode === "delete") {
        $.ajax({
            "url": " https://myanimelist.net/api/animelist/delete/" + id + ".xml",
            "type": "POST",
            "success": alertHappen,
            "error": postToMalFail,
            "username": user,
            "password": password
        });
    }
    else if (mode == "user values") {
        $.ajax({
            "url": "http://myanimelist.net/malappinfo.php",
            "data": {"u": user, "status": "all", "type": "anime"},
            "success": findAnimeCreator(id, data.title, data.episodes),
            "dataType": "xml",
            "error": userFail
        });
    }
}
/* Sends information to be displayed to the user*/
function sendInfo(text) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "information update", "text": text});
    });
}

function alertHappen(data, textStatus, jqXHR) {
    sendInfo(jqXHR.responseText);
}


