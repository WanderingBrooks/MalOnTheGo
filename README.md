For information on how to implement the malanywhere api see the JavaScript file [malotg-controller.js](https://github.com/WanderingBrooks/MalOnTheGo/blob/master/JavaScript/malotg-controller.js). Theres a lot of code related to chrome that can be ignored the lines that call the api are 31 and 48.

**This can be added to chrome [here!](https://chrome.google.com/webstore/detail/malonthego/pgfecfcomkboinfddemijongdccpacmj)**

Thanks [alevine26](https://github.com/alevine26) for helping test and finding bugs,</br>
and [kj800x](https://github.com/kj800x) for helping me get started learning web dev and the code review!


## Basic Understanding
If you don't know what [MyAnimeList](https://myanimelist.net/) or [Crunchyroll.com](https://crunchyroll.com/) are read this!
  To understand what this chrome exstension does an understanding of MyAnimeList is neccesary. MyAnimeList.net is a website that allows individual users to keep track of what animes they are watching, completed, plan to watch and so on. It is also an online community where people can discuss, ask question like any interent forum. 
  
Crunchyroll.com is an anime streaming website that I and other anime fans use, many currently airing shows and a few past shows are streamed on this site.

## MalOTG
MalOTG is a Chrome Exstension that adds the ability to edit a users myanimelist values for the current show they are watching on crunchyroll.com. This is done using JavaScript, HTML, CSS, jQuery, the Myanimelist api and Chromes apis. The chrome exstension is currently in a private beta but has an expected public release of March 2017. This allows the user to edit their score or most values on myanimelist directly form the website they are watching the show on 

##Current Issues:
  Errors from the Chrome apis or the Myanimelist apis are handeled but not optimally.
  
  
## Images 

Crunchyroll with the exstension enabled
![Some Fields](https://github.com/WanderingBrooks/MalOnTheGo/blob/master/images/DefaultUi.PNG)

All of the fields opened
![All Fields](https://github.com/WanderingBrooks/MalOnTheGo/blob/master/images/ExpandedUi.PNG)




