# liri-node-app

#### This is my finished LIRI assignment, which uses inquirer to provide the user a list of commands.  These commands will allow the user to search one of three API's for information about a movie, the next venue a band will appear at, or information about a song.

## How it works:
1. The user first chooses one of four commands from the list.
1. If the user chooses to search Spotify, Bands in Town, or OMDB, they will be given a search prompt.
        * Regardless of what is searched, the interface is the same
1. After typing in their search term and hitting enter, a console log with the requested results will be printed.
* **_However_**, if the user chooses to read the command from the text file, then both the API and search term will be lifted from a file called 'random.txt', with the two parameters (API and search) being separated by a comma.
    * __The results will be printed the same way as if the user entered the information directly.__

