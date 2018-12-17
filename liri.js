require("dotenv").config(); // Set up dotenv for key storage purposes

var moment = require("moment");
var Spotify = require("node-spotify-api");
var inquirer = require("inquirer"); // Set up inquirer for user input
var request = require("request"); // Set up request for most API operations (not Spotify)
var fs = require("fs"); // Include the node file system (no install required)

var keys = require("./keys"); // Get the export object from "keys.js" and store in variable

// Takes the spotify object imported from "keys.js" and inserts it as a parameter to a new node-spotify-api instance
var spotify = new Spotify(keys.spotify);

// Creates a new object instances to hold api object exports from 'keys.js'
var omdb = keys.omdb;
var bands = keys.bandsInTown;

// Function to parse text file for command
function parseTextandRun() {
    var APIchoice;
    var query = { // Make this an object instead of just a string for easy import into runSearch
        search: ""
    };
    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
            console.log("Error:", error)
        }
        {
            var output = data.split(","); // Split string into 2 arrays separated by comma
            APIchoice = output[0]; // Should be string for search type
            query.search = output[1]; // String for search
            runSearch(APIchoice, query);
        }
    })
}

function runSearch(choice, query) { // Query is object containing search string passed from inquiry
    switch(choice) { // Done since search mechanism is not uniform across API's
            case "spotify-this-song":
                spotify.search({type: 'track', query: query.search}, function(error, data) {
                    if (!error) {
                        var songInfo = data.tracks.items[0];
                        console.log("Artist(s):");
                        songInfo.artists.forEach(function(artist) {
                            console.log("\t", artist.name);
                        })
                        console.log("\nSong Name:", songInfo.name);
                        console.log("\nPreview Link:", songInfo.preview_url); 
                        console.log("\nSong Album:", songInfo.album.name);
                    }
                    else {
                        console.log("Error:", error);
                    }
                })
                break;
            case "concert-this":
                request("https://rest.bandsintown.com/artists/" + query.search + "/events?app_id=" + bands.key, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var concert = JSON.parse(body);
                        if (typeof concert[0] !== 'undefined') {
                            var date = moment(concert[0].venue.datetime); // Store date in moment object to change output format
                            console.log("Name of Venue:", concert[0].venue.name);
                            // If region isn't specified (such as for a city in Canada), it will be left out
                            if (concert[0].venue.region === "") {
                                console.log("\nVenue Location: " + concert[0].venue.city + ", " + concert[0].venue.country);
                            }
                            else {
                                console.log("\nVenue Location: " + concert[0].venue.city + ", " + concert[0].venue.region + ", " + concert[0].venue.country);
                            }
                            console.log("\nDate of Event:", date.format("MM/DD/YYYY"));
                        }
                        else {
                            console.log("This artist/band does not currently have a venue listed.");
                        }
                    }
                    else  {
                        console.log("Error:", error);
                    }
                })
                break;
            case "movie-this":
                request("http://www.omdbapi.com/?t=" + query.search + "&y=&plot=short&apikey=" + omdb.key, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var movie = JSON.parse(body);
                        console.log("Movie Title:", movie.Title);
                        console.log("\nYear of Release:", movie.Year)
                        console.log("\nRating on IMDB:", movie.imdbRating);
                        // Added to prevent error when movie does not have a full ratings index
                        if (typeof movie.Ratings[1] !== 'undefined') {
                            console.log("\nRating on Rotten Tomatoes:", movie.Ratings[1].Value);
                        }
                        console.log("\nCountry of production:", movie.Country);
                        console.log("\nLanguage:", movie.Language);
                        console.log("\nPlot:", movie.Plot);
                        console.log("\nActors:", movie.Actors);
                    }
                    else {
                        console.log("Error:", error);
                    }
                })
                break;
    }
}

// Function to run the requested type of search
function search(APIchoice) {
    console.log(APIchoice);
    inquirer.prompt({
        type: "input",
        name: "search",
        message: "Type in what you would like to search: "
    }).then(function(query) {
        runSearch(APIchoice, query);
    })
}

// Code for getting user command input (will use list form)
inquirer.prompt({
    name: "choice",
    type: "list",
    message: "What would you like to do?",
    choices: ["Search for a concert by artist", "Search Spotify", "Search for a movie", "Get command from file"]
}).then(function(command) {
    switch (command.choice) {
        case "Search for a concert by artist":
            search("concert-this");
            break;
        case "Search Spotify":
            search("spotify-this-song");
            break;
        case "Search for a movie":
            search("movie-this");
            break;
        case "Get command from file":
            parseTextandRun();
            break;
    }
})