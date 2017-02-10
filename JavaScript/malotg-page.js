// Listener for the backend sending a request
chrome.runtime.onMessage.addListener(function(request) {
    malotgUIController(request)
});
// Function that interprets the request and delegates it to the right functions
function malotgUIController(request) {
    if (request.message === ("show hide")) {
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
    else if (request.message === "set values") {
        var fileLocation = chrome.extension.getURL('/HTML/malotg-snipet.html');
        var injectLocation = function (div) {
            var sidebar = document.getElementById("sidebar");
            if (document.getElementById("showmedia_free_trial_signup")) {
                sidebar.insertBefore(div, sidebar.childNodes[2]);
            }
            else {
                sidebar.insertBefore(div, sidebar.childNodes[0]);
            }
            div.setAttribute("class", "showmedia-leftbox clearfix large-margin-bottom");
        };
        valuesOnMal = request.values;
        inject(fileLocation, injectLocation);

        // Injects the html from fileLocation into the injectLocation
        function inject(fileLocation, injectLocation) {
            code = request.code;
            advancedOptions = false;
            // Has it already been injected
            if (!(document.getElementById("malotg"))) {
                // If not inject into page
                var div = document.createElement("div");
                div.id = "malotg";
                $.get(fileLocation, function (data) {
                    div.innerHTML = data;
                    injectLocation(div);
                    document.getElementById("malotg").style.display = "none";
                    createListeners();
                    setValues();
                    $(function () {
                        $("#malotg-my_start_date").datepicker({
                            changeMonth: true,
                            changeYear: true
                        });
                        $("#malotg-my_finish_date").datepicker({
                            changeMonth: true,
                            changeYear: true
                        });
                    });
                    document.getElementById("malotg").style.display = "inline";
                });
            }
            // If its already been injected update the values
            else {
                setValues();
                document.getElementById("malotg").style.display = "inline";
            }
        }

        // Creates the listeners for each clickable element in the malotg-snipet.html file
        function createListeners() {

            // Sends the info stored in malotg's fields to the backend to be sent to mal
            function submitListener() {
                var info = {
                    "data": {
                        "episode": document.getElementById("malotg-my_watched_episodes").value,
                        "status": indexToMalStatus(document.getElementById("malotg-my_status").selectedIndex),
                        "score": scoreIndex(document.getElementById("malotg-my_score").selectedIndex),
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
                    "id": valuesOnMal.series_animedb_id,
                    "advancedOptions": advancedOptions
                };
                // If it isn't on mal already it needs to be added
                if (code === 0) {
                    // The code needs to be updated because now the user has info on MAL
                    info.message = "add";
                    code = 1;
                    malotgRequest(info, request);
                }
                // If the user has values already it need to be updated
                else if (code === 1) {
                    info.message = "update";
                    malotgRequest(info, request);
                }

            }

            // To delete the anime off the users list
            function deleteListener() {
                var info = {
                    "message": "delete",
                    "data": valuesOnMal.series_animedb_id
                };
                code = 0;
                malotgRequest(info, request);
                // The code is changed,the html fields are cleared and the local copy of values are updated
                setValues();

            }

            // Hide the Advanced options section of the malotg-snipet.html
            function showAdvancedListener() {
                if (document.getElementById("malotg-advanced")) {
                    if (document.getElementById("malotg-advanced").style.displey = "none") {
                        document.getElementById("malotg-advanced").style.display = "inline";
                        document.getElementById("malotg-hide-advanced").style.display = "inline";
                        document.getElementById("malotg-show-advanced").style.display = "none";
                    }
                }
            }

            // Show the Advanced options section of the malotg-snipet.html
            function hideAdvancedListener() {
                if (document.getElementById("malotg-advanced")) {
                    if (document.getElementById("malotg-advanced").style.displey = "inline") {
                        document.getElementById("malotg-advanced").style.display = "none";
                        document.getElementById("malotg-hide-advanced").style.display = "none";
                        document.getElementById("malotg-show-advanced").style.display = "inline";
                    }
                }
            }

            // Are the values currently on mal different then the ones in the fields here
            function valueChange() {
                return document.getElementById("malotg-my_status").selectedIndex != malToIndexStatus(valuesOnMal.my_status) ||
                    document.getElementById("malotg-my_watched_episodes").value != valuesOnMal.my_watched_episodes ||
                    document.getElementById("malotg-my_score").selectedIndex != scoreIndex(valuesOnMal.my_score) ||
                    document.getElementById("malotg-my_start_date").value != formatDate(valuesOnMal.my_start_date) ||
                    document.getElementById("malotg-my_finish_date").value != formatDate(valuesOnMal.my_finish_date) ||
                    document.getElementById("malotg-my_tags").value != valuesOnMal.my_tags;
            }

            // Update the local copy of what is stored of mal
            function malotgUpdateValues() {
                valuesOnMal = {
                    "series_title": valuesOnMal.series_title,
                    "my_status": indexToMalStatus(document.getElementById("malotg-my_status").selectedIndex),
                    "my_score": scoreIndex(document.getElementById("malotg-my_score").selectedIndex),
                    "series_episodes": valuesOnMal.series_episodes,
                    "my_watched_episodes": document.getElementById("malotg-my_watched_episodes").value,
                    "my_start_date": document.getElementById("malotg-my_start_date").value.split("/").join(""),
                    "my_finish_date": document.getElementById("malotg-my_finish_date").value.split("/").join(""),
                    "my_tags": document.getElementById("malotg-my_tags").value,
                    "series_animedb_id": valuesOnMal.series_animedb_id,
                    "user": valuesOnMal.user,
                    "password": valuesOnMal.password
                }
            }

            // This function opens options not supported on the mal api on the mal website
            function moreOptionsListener() {
                // If the user has changed the values before going to mal those should be updated
                if (valueChange()) {
                    advancedOptions = true;
                    submitListener();
                }
                else {
                    openEditPage(valuesOnMal.series_animedb_id);
                }
            }

            // Shows the login field of the malotg-snipet.html file
            function showLoginListener() {
                if (document.getElementById("malotg-login")) {
                    if (document.getElementById("malotg-login").style.displey = "none") {
                        document.getElementById("malotg-login").style.display = "inline";
                        document.getElementById("malotg-hide-login").style.display = "inline";
                        document.getElementById("malotg-show-login").style.display = "none";
                    }
                }
            }

            // Hides the login field of the malannywhere-snipet.html file
            function hideLoginListener() {
                if (document.getElementById("malotg-login")) {
                    if (document.getElementById("malotg-login").style.displey = "inline") {
                        document.getElementById("malotg-login").style.display = "none";
                        document.getElementById("malotg-hide-login").style.display = "none";
                        document.getElementById("malotg-show-login").style.display = "inline";
                    }
                }
            }

            // Sends the credentials to be saved bu the developer
            function saveCredentialsListener() {
                var username = document.getElementById("malotg-username").value;
                var password = document.getElementById("malotg-password").value;
                var info = {
                    "message": "save credentials",
                    "username": username,
                    "password": password
                };
                malotgRequest(info, request);
            }

            // Clear credentials stored for the user
            function deleteCredentialsListener() {
                var info = {
                    "message": "delete credentials"
                };
                malotgRequest(info, request);
            }

            // Function that turns the password input from password to text and vise versa
            function togglePassword() {
                var password = document.getElementById("malotg-password");
                if (password.type == "password") {
                    password.setAttribute('type', 'text');
                }
                else {
                    password.setAttribute('type', 'password');
                }
            }

            // Sets up the listeners for all the button and their respective functions
            $("#malotg-submit").on("click", submitListener);
            $("#malotg-delete").on("click", deleteListener);
            $("#malotg-show-advanced").on("click", showAdvancedListener);
            $("#malotg-hide-advanced").on("click", hideAdvancedListener);
            $("#malotg-more-options").on("click", moreOptionsListener);
            $("#malotg-hide-login").on("click", hideLoginListener);
            $("#malotg-show-login").on("click", showLoginListener);
            $("#malotg-in").on("click", saveCredentialsListener);
            $("#malotg-out").on("click", deleteCredentialsListener);
            $("#malotg-showhide-password").on("click", togglePassword);


        }

        /*
         Sets the fields of the created to div
         Code Table:
         -2: Insert Login hide everything else
         -1: Insert Error show not found
         0: Anime found but user does not have it on their list
         1: Anime is on Mal and the user has values already stored
         */
        function setValues() {
            // Hide everything except the login field
            if (code == -2) {
                document.getElementById("malotg-values").style.display = "none";
                document.getElementById("malotg-login").style.display = "inline";
                document.getElementById("malotg-show-login").style.display = "none";
                document.getElementById("malotg-hide-login").style.display = "inline";
                document.getElementById("malotg-in").style.display = "inline";
                document.getElementById("malotg-out").style.display = "none";
                document.getElementById("malotg-login-links").style.display = "inline";
                document.getElementById("malotg-signup").style.display = "inline";
            }
            else if (code == -1) {
                hideLogin();
                document.getElementById("malotg-series_title").textContent = request.title;
                document.getElementById("malotg-series_title").href = "https://myanimelist.net/" + "404" + "/";
                document.getElementById("malotg-my_status").disabled = true;
                document.getElementById("malotg-my_watched_episodes").disabled = true;
                unknownEpisodes();
                document.getElementById("malotg-my_score").disabled = true;
                document.getElementById("malotg-my_finish_date").disabled = true;
                document.getElementById("malotg-my_start_date").disabled = true;
                document.getElementById("malotg-my_tags").disabled = true;
                document.getElementById("malotg-more-options").disabled = true;
                document.getElementById("malotg-submit").disabled = true;
                document.getElementById("malotg-delete").disabled = true;
                document.getElementById("malotg-username").value = valuesOnMal.user;
                document.getElementById("malotg-password").value = valuesOnMal.password;
            }
            else if (code == 0) {
                hideLogin();
                document.getElementById("malotg-series_title").textContent = valuesOnMal.series_title;
                document.getElementById("malotg-series_title").href = "https://myanimelist.net/anime/" + valuesOnMal.series_animedb_id + "/";
                document.getElementById("malotg-my_status").selectedIndex = 0;
                document.getElementById("malotg-my_watched_episodes").value = 0;
                unknownEpisodes();
                document.getElementById("malotg-my_score").selectedIndex = 0;
                document.getElementById("malotg-my_start_date").value = "";
                document.getElementById("malotg-my_finish_date").value = "";
                document.getElementById("malotg-my_tags").value = "";
                document.getElementById("malotg-more-options").href = "https://myanimelist.net/ownlist/anime/" + valuesOnMal.series_animedb_id + "/edit";
                document.getElementById("malotg-username").value = valuesOnMal.user;
                document.getElementById("malotg-password").value = valuesOnMal.password;
            }
            else if (code == 1) {
                hideLogin();
                document.getElementById("malotg-series_title").textContent = valuesOnMal.series_title;
                document.getElementById("malotg-series_title").href = "https://myanimelist.net/anime/" + valuesOnMal.series_animedb_id + "/";
                document.getElementById("malotg-my_status").selectedIndex = malToIndexStatus(valuesOnMal.my_status);
                document.getElementById("malotg-my_watched_episodes").value = valuesOnMal.my_watched_episodes;
                unknownEpisodes();
                document.getElementById("malotg-my_score").selectedIndex = scoreIndex(valuesOnMal.my_score);
                document.getElementById("malotg-my_start_date").value = formatDate(valuesOnMal.my_start_date);
                document.getElementById("malotg-my_finish_date").value = formatDate(valuesOnMal.my_finish_date);
                document.getElementById("malotg-my_tags").value = valuesOnMal.my_tags;
                document.getElementById("malotg-more-options").href = "https://myanimelist.net/ownlist/anime/" + valuesOnMal.series_animedb_id + "/edit";
                document.getElementById("malotg-username").value = valuesOnMal.user;
                document.getElementById("malotg-password").value = valuesOnMal.password;
            }
        }
    }
    // Update malotg-info and check advanced options
    else if (request.message === "information update") {
        if (document.getElementById("malotg")) {
            document.getElementById("malotg-info").textContent = request.text;
            setTimeout(function () {
                document.getElementById('malotg-info').textContent = 'MalOnTheGo';
            }, 1000);
            // if advancedOptions then the info has been save to mal now open the edit page for this anime
            if (request.advancedOptions) {
                openEditPage(request.id);
                advancedOptions = false;
            }
            // Crednetials are now correct restart getting title process
            if (request.code == 2) {
                malotgSendTitles(request);
            }

            malotgUpdateValues();
        }
    }
    // Initializes two variables
    else if (request.message === "initialize") {
        // Local copy of the values for this anime stored on myanimelist
        var valuesOnMal;
        // If the user pressed the advance options button this tells the submit listener to update before going to
        // the mal website
        var advancedOptions;
        // Code keeps track of the current state thats being displayed and =how the info is stored on mal
        var code;
    }
    // Open the edit page for the given anime id
    function openEditPage(id) {
        window.open("https://myanimelist.net/ownlist/anime/" + id + "/edit", '_blank');
    }

    /* converts index from select to a value for MAL or a values for MAL to an index*/
    function scoreIndex(index) {
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

    /* Formats the My anime list formatted date to human readable version
     * Input is text not a JQUERY object*/
    function formatDate(date) {
        if (date === '0000-00-00') {
            return '';
        }
        else if (date === "") {
            return "";
        }
        else {
            return date.substring(5, 7) + "/" + date.substring(8) + "/" + date.substring(0, 4);
        }
    }

    /*If there are an unknown number of episodes because the show is airing MAL stores
     * a 0 as the total number of episodes this checks if that is the case*/
    function unknownEpisodes() {
        if (valuesOnMal.series_episodes == 0 || valuesOnMal.series_episodes === "") {
            document.getElementById("malotg-series_episodes").textContent = "?"
        }
        else {
            document.getElementById("malotg-my_watched_episodes").max = valuesOnMal.series_episodes;
            document.getElementById("malotg-series_episodes").textContent = valuesOnMal.series_episodes;

        }
    }

    /*
    Hides login and show the appropriate buttons to allow the user to show the login fields
     */
    function hideLogin() {
        document.getElementById("malotg-values").style.display = "inline";
        document.getElementById("malotg-login").style.display = "none";
        document.getElementById("malotg-show-login").style.display = "inline";
        document.getElementById("malotg-hide-login").style.display = "none";
        document.getElementById("malotg-in").style.display = "none";
        document.getElementById("malotg-out").style.display = "inline";
        document.getElementById("malotg-login-links").style.display = "none";
        document.getElementById("malotg-signup").style.display = "none";
    }
}

// When the document is loaded the process begins
$(document).ready(malotgSendTitles);
// Grabs the titles from the page and makes any necessary changes to those titles so they will show up on the Mal search
function malotgSendTitles(request) {
    var URL = document.URL;
    // Were on Crunchyroll
    if (URL.indexOf("crunchyroll.com") != -1) {
        // Has to be on the episode page other wise we don't do anything
        if (document.getElementById("showmedia_video")) {
            malotgUIController({"message": "initialize"});
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
                "titles": titles
            });
        }
    }
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

// Sends a request to the backend containing the given info.
function malotgRequest(info) {
    info.url = document.URL;
    chrome.runtime.sendMessage(info);
}