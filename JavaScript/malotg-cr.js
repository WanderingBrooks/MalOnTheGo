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

