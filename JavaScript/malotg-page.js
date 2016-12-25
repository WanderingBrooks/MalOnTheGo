// Message passing listener
chrome.runtime.onMessage.addListener(function(request) {
    if ( request.message === "clicked_browser_action" ) {
        request.message = "show hide";
    }
    else if (request.message === "set values") {
        request.fileLocation = chrome.extension.getURL('/HTML/malanywhere-snipet.html');
        request.injectLocation =  function(div) {
            var sidebar = document.getElementById("sidebar");
            if (document.getElementById("showmedia_free_trial_signup")) {
                sidebar.insertBefore(div, sidebar.childNodes[2]);
            }
            else {
                sidebar.insertBefore(div, sidebar.childNodes[0]);
            }
        };
    }
    malanywhereUIController(request);
});

$(document).ready(sendTitles);

function sendTitles() {
    var URL = document.URL;
    // Were on Crunchyroll
    if (URL.indexOf("crunchyroll.com") != -1) {
        // Has to be on the episode page other wise we don't do anything
        if (document.getElementById("showmedia_video")) {
            var titles = [];
            var aboveVideo = $("#template_body > div.new_layout.new_layout_wide > div.showmedia-trail.cf > div > h1 > a > span").text();
            var belowVideo = $("#showmedia_about_episode_num > a").text();
            var movie = $("#showmedia_about_episode_num").text();
            URL = parseCR(URL);
            // If the user isn't logged in the paths above do not work
            if (document.getElementById("showmedia_free_trial_signup")) {
                aboveVideo = $("#template_body > div:nth-child(6) > div.showmedia-trail.cf > div > h1 > a > span").text();
            }
            if (aboveVideo.indexOf(" (Uncensored)") != -1) {
                aboveVideo = aboveVideo.substring(0, aboveVideo.indexOf(" (Uncensored)"));
            }
            if (aboveVideo.indexOf(" (Subtitled)") != -1) {
                aboveVideo = aboveVideo.substring(0, aboveVideo.indexOf(" (Subtitled)"));
            }
            if (aboveVideo.indexOf(" (Dubbed)") != -1) {
                aboveVideo = aboveVideo.substring(0, aboveVideo.indexOf(" (Dubbed)"));
            }
            titles[0] = aboveVideo;
            titles[1] = URL;
            if (movie.length > belowVideo.length && belowVideo != "") {
                titles[2] = belowVideo;
            }
            else {
                titles[2] = movie;
            }
            chrome.runtime.sendMessage({
                "message": "get info",
                "data": {
                    "titles": titles
                }
            });
        }
    }
}

// Function to add update or delete sends to back end.
function malanywhereRequest(info) {
    chrome.runtime.sendMessage(info);
}

// Parses the given crunchyroll url for the title of the show
function parseCR(URL) {
    var CR = "http://www.crunchyroll.com/";
    var titleURL = "";
    var index = CR.length;
    for (var i = index; i < URL.length; i++) {
        var c = URL.charAt(i);
        if (c == '/') {
            break;
        }
        else if (c == '-') {
            titleURL += ' ';
        }
        else {
            titleURL += c;
        }
    }
    return titleURL;
}



