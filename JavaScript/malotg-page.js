// Message passing listener
chrome.runtime.onMessage.addListener(
    function(request) {
        if( request.message === "clicked_browser_action" ) {
            // does the Element actually exist
            if (document.getElementById("malotg")) {
                // Switch between hidden and visible
                if (document.getElementById("malotg").style.display == "inline") {
                    document.getElementById("malotg").style.display = "none";
                }
                else if (document.getElementById("malotg").style.display == "none") {
                    document.getElementById("malotg").style.display = "inline";
                }
            }
        }
        // Inject HTML snippet into page
        else if ( request.message === "set_status" ) {
            inject(request.code, request.values);
        }

        else if ( request.message === "information update") {
            if (document.getElementById("malotg")) {
                document.getElementById("malotg-info").textContent = request.text;
                setTimeout(function() {
                    document.getElementById('malotg-info').textContent = 'MalOnTheGo';
                }, 1000);
            }
        }


    }
);

$(document).ready(function() {
    var URL = document.URL;
    // Were onn Crunchyroll
    if (URL.indexOf("crunchyroll.com") != -1) {
        // Has to be on the episode page other wise we don't do anything
        if (document.getElementById("showmedia_video")) {
            var aboveVideo = $("#template_body > div.new_layout.new_layout_wide > div.showmedia-trail.cf > div > h1 > a > span").text();
            var belowVideo = $("#showmedia_about_episode_num > a").text();
            var movie = $("#showmedia_about_episode_num").text();
            // If the user isn't logged in the paths above do not work
            if (document.getElementById("showmedia_free_trial_signup")) {
                aboveVideo = $("#template_body > div.showmedia-trail.cf > div > h1 > a > span").text();
            }
            if (aboveVideo.indexOf(" (Uncensored)") != -1) {
                aboveVideo = aboveVideo.substring(0, aboveVideo.indexOf("(Uncensored)"));
            }
            if (movie.charAt(0) != " ") {
                chrome.runtime.sendMessage({
                    "message": "get info",
                    "data": {
                        "url": URL,
                        "aboveVideo": aboveVideo,
                        "belowVideo": belowVideo
                    }

                });
            }
            else {
                chrome.runtime.sendMessage({
                    "message": "get info",
                    "url": URL,
                    "aboveVideo": aboveVideo,
                    "movie": movie
                });
            }
        }
    }



});

function createListeners(code, id) {
    function submitListener() {

        if (code === -1) {
            code = 0;
            chrome.runtime.sendMessage({
                "message": "add",
                "data": {
                    "episode": document.getElementById("malotg-my_watched_episodes").value,
                    "status": indexToMalStatus(document.getElementById("malotg-my_status").selectedIndex),
                    "score": indexToMalScore(document.getElementById("malotg-my_score").selectedIndex),
                    "storage_type": "",
                    "storage_value": "",
                    "times_rewatched": "",
                    "rewatch_value": "",
                    "date_start": document.getElementById("malotg-my_start_date").value.split("/").join(""),
                    "date_finish": document.getElementById("malotg-my_finish_date").value.split("/").join(""),
                    "priority": "",
                    "enable_discussion": "",
                    "enable_rewatching": "",
                    "comments": "",
                    "tags": ""
                },
                "id": id
            });
        }
        else if (code === 0) {
            chrome.runtime.sendMessage({
                "message": "update",
                "data": {
                    "episode": document.getElementById("malotg-my_watched_episodes").value,
                    "status": indexToMalStatus(document.getElementById("malotg-my_status").selectedIndex),
                    "score": indexToMalScore(document.getElementById("malotg-my_score").selectedIndex),
                    "storage_type": "",
                    "storage_value": "",
                    "times_rewatched": "",
                    "rewatch_value": "",
                    "date_start":  document.getElementById("malotg-my_start_date").value.split("/").join(""),
                    "date_finish": document.getElementById("malotg-my_finish_date").value.split("/").join(""),
                    "priority": "",
                    "enable_discussion": "",
                    "enable_rewatching": "",
                    "comments": "",
                    "tags": ""
                },
                "id": id
            });
        }

    }



        function deleteListener() {
        code = -1
            chrome.runtime.sendMessage({
                "message": "delete",
                "id": id,
                "data": -1
            });
        }

        $("#malotg-submit").on("click", submitListener);
        $("#malotg-delete").on("click", deleteListener);

}


function setStatus(code, currentStatus) {
    if (code == -2) {
        document.getElementById("malotg-series_title").textContent = "Anime Not Found";
        document.getElementById("malotg-series_title").href = "https://myanimelist.net/" + "404" + "/" ;
        document.getElementById("malotg-my_status").disabled = true;
        document.getElementById("malotg-my_watched_episodes").disabled = true;
        document.getElementById("malotg-my_score").disabled = true;
        document.getElementById("malotg-my_finish_date").disabled = true;
        document.getElementById("malotg-my_start_date").disabled = true;
    }
    else if (code == -1) {
        if (currentStatus.series_episodes == 0) {
            currentStatus.series_episodes = "?"
        }
        else {
            document.getElementById("malotg-my_watched_episodes").max = currentStatus.series_episodes;
        }
        document.getElementById("malotg-series_title").textContent = currentStatus.series_title;
        document.getElementById("malotg-series_title").href = "https://myanimelist.net/anime/" + currentStatus.series_animedb_id + "/" ;
        document.getElementById("malotg-my_status").selectedIndex = 0;
        document.getElementById("malotg-my_watched_episodes").value = 0;
        document.getElementById("malotg-series_episodes").textContent = currentStatus.series_episodes;
        document.getElementById("malotg-my_score").selectedIndex = 0;
    }
    else if (code == 0) {
        if (currentStatus.series_episodes == 0) {
            currentStatus.series_episodes = "?"
        }
        else {
            document.getElementById("malotg-my_watched_episodes").max = currentStatus.series_episodes;
        }
        document.getElementById("malotg-series_title").textContent = currentStatus.series_title;
        document.getElementById("malotg-series_title").href = "https://myanimelist.net/anime/" + currentStatus.series_animedb_id + "/" ;
        document.getElementById("malotg-my_status").selectedIndex = malToIndexStatus(currentStatus.my_status);
        document.getElementById("malotg-my_watched_episodes").value = currentStatus.my_watched_episodes;
        document.getElementById("malotg-series_episodes").textContent = currentStatus.series_episodes;
        document.getElementById("malotg-my_score").selectedIndex = malToIndexScore(currentStatus.my_score);
        document.getElementById("malotg-my_start_date").value = currentStatus.my_start_date;
        document.getElementById("malotg-my_finish_date").value = currentStatus.my_finish_date;
    }
}

function inject(code, currentStatus) {
    var div = document.createElement("div");
    div.id = "malotg";
    var sidebar = document.getElementById("sidebar");
    $.get(chrome.extension.getURL('/HTML/malotg-snipet.html'), function(data) {
        div.innerHTML = data;
        // Will be made Generic later
        if (document.getElementById("showmedia_free_trial_signup")) {
            sidebar.insertBefore(div, sidebar.childNodes[2]);
        }
        else {
            sidebar.insertBefore(div, sidebar.childNodes[0]);
        }
        document.getElementById("malotg").style.display = "none";
        setStatus(code, currentStatus);
        createListeners(code, currentStatus.series_animedb_id);
        $( function() {
            $( "#malotg-my_start_date" ).datepicker({changeMonth: true,
                changeYear: true});
            $( "#malotg-my_finish_date" ).datepicker({changeMonth: true,
                changeYear: true});
        } );
        document.getElementById("malotg").style.display = "inline";
    });

}

/* converts Myanimelist value to index in a select*/
function malToIndexScore(value) {
    if (value == 0) {
        return 0;
    }
    else {
        return 11 - value;
    }
}
/* converts index from select to a value for MAL */
function indexToMalScore(index) {
    if (index == 0) {
        return 0;
    }
    else {
        return 11 - index;
    }
}

/* Converts Mal format to index
 *  1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch */
function malToIndexStatus(value) {
    if (value == 6) {
        return 4;
    }
    else {
        return value - 1;
    }
}

/* Converts index to Mal
 *  1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch */
function indexToMalStatus(index) {
    if (index == 4) {
        return 6;
    }
    else {
        return index + 1;
    }
}

