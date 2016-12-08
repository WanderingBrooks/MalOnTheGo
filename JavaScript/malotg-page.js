// Message passing listener
chrome.runtime.onMessage.addListener(function(request) {
    if ( request.message === "clicked_browser_action" ) {
        request.message = "show hide";
    }
    if (request.message === "set status") {
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
    malotgControl(request);
});

$(document).ready(function() {
    var URL = document.URL;
    // Were onn Crunchyroll
    if (URL.indexOf("crunchyroll.com") != -1) {
        // Has to be on the episode page other wise we don't do anything
        if (document.getElementById("showmedia_video")) {
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
                alert(aboveVideo);
                aboveVideo = aboveVideo.substring(0, aboveVideo.indexOf(" (Dubbed)"));
                alert(aboveVideo.length);
            }
            if (movie.length > belowVideo.length && belowVideo != "") {
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
                    "data": {
                        "url": URL,
                        "aboveVideo": aboveVideo,
                        "movie": movie
                    }
                });
            }
        }
    }



});

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



