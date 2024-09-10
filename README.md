# Notes (Flashcards)
#### Video Demo:  <https://youtu.be/tKP-R_0HfpE>

### Description:

Notes allows users to play an online musical flashcard game that teaches them the notes of the treble and bass clefs.

### Background:

Reading music fluently on guitar relies on the automatic, rapid association of three separate concepts:

- Notes on the staff and note names
- Note names and fret-string combinations
- Fret-string combinations and notes on the staff

Notes is a web application I built using Flask and Javascript to tackle the first of these challenges.

### Using the app

Upon navigating to the site for the first time, users are presented with a login page and the option to register for an account if they don’t already have one. After registering, the website presents the user with the flashcard widget. To play the user simply presses the start button which starts a timer and shows the user their first note. To identify the note, the user can type the letter name on a keyboard, or click the corresponding button. The program logs all correct and incorrect inputs, and ignores extraneous clicks and key presses. After identifying the note correctly, the program shows the user another note. The user’s score is also calculated using a combination of correct inputs, incorrect inputs, and the elapsed time. A toggle switch at the bottom of the widget allows the user to switch between the two most common clefs: **treble** and **bass**. Upon pressing the stop button, assuming the user has made at least one input, the following stats from the current session are sent to the server and logged in a SQL database:

- the number of correct inputs
- the number of incorrect inputs
- the average seconds that elapsed per correct input
- the score

Using the "My Scores" button at the top of the screen, the user can view the following metrics in table form:

- score
- timestamp
- correct inputs
- incorrect inputs
- average seconds per note

Using the "Leaderboard" button at the top of the screen, the user can view the following metrics from the Notes community in table form, sorted by score in descending order:

- username
- score
- timestamp
- correct inputs
- average seconds per note

### Construction:

#### Python

I used Flask as the backend framework, and loaded in a number of external libraries for the following functions:

- **json** for parsing user data
- **cs50** for running SQL commands
- **werkzeug.security** for hashing passwords
- **datetime** for generating timestamps
- **helpers** for generating apology messages and ensuring the user has signed in

The routes are:

- **index** for serving up the widget
- **user_data** for handing POST requests from the user, and logging them in the SQL database
- **leaderboard** for serving up a table of scores and stats from all users
- **scores** for serving up a table of scores and stats from the current user
- **register** for serving up a register form and creating the user's account
- **login** for serving up a login form and logging the user in
- **logout** for logging the user out

#### HTML

I stored my html files in a templates folder, and used Jinja to extend my layout.html file. In addition to layout.html, I included:

- **register.html** for allowing the user to create an account
- **login.html** for allowing the user to log into their (existing) account
- **index.html** for storing the html of the widget itself
- **leaderboard.html** for generating a table of the top 10 user scores
- **scores.html** for generating a table of the 150 most recent scores from the current user
- **apology.html** for generating an apology image based on the user's input

#### CSS

In addition to bootstraps CSS, I used my own style sheet, styles.css to handle the styling of the widget itself.

#### JavaScript

The logic of the widget happens in script.js. First, I declare an event listener to check that the website has loaded fully before running the script. Then I define some global variables. Next I define some functions:

##### update_average()

update_average() updates the user’s score. The score is defined as **(10c - 5i) / a** where *c* is the number of correct inputs, *i* is the number of incorrect inputs, and *a* is the average number of seconds per correct input. Note that score is rounded to the nearest whole number, and a lower limit is set at 0.

##### random_note()

random_note() generates a random note picture. To do this, I first get a random integer between 0 and the number of note pictures (predefined as "picture_count") using the Math library. I then use that random number to index into the list of notes. update_average() is then called. Flags to determine the clef and the correct note are updated, and a tally of the total correct inputs is updated. Finally, the function returns the string of the location of the randomly generated note.

##### displayTimer()

displayTimer() runs the timer. Variables for milliseconds, seconds, and minutes are declared and updated accordingly. Before updating the HTML, new variables for milliseconds, seconds, and minutes are declared and formatted.

I added some event listeners for what should happen when the user clicks or types the various buttons

#### SQL

The SQL database, notes.db, contains two tables:

- users
- scores

The users table contains the following columns:

- id, the primary key which auto-increments, starting with 1
- username, the provided username of all players
- hash, the hash value of all passwords, hashed using sha256
- high_score, each user's highest score to date

The scores table contains the following columns:

- id, the primary key of the current session, which auto-increments starting with 1
- correct, the number of correct inputs the user made for each session
- incorrect, the number of incorrect inputs the user made for each session
- sec_per_note, the average seconds per correct input that elapsed for each session
- score, the score of the current session
- timestamp, the date and time of each session
- user_id, the user_id associated with each session

The foreign key in scores, user_id, references the primary key in users, id.

### Additional materials

I put pictures treble and bass clef notes in the static folder. The names of these files are referenced in script.js, so their names are important to allow the generation of a random note.

> note that while the naming conventions are unwieldy ("A1," "C3," etc...), this is the standard naming convention in music

my hope is that this app can be used as a fun way to solve one of the most common problems I see in my young music students, which is that they don’t know the notes of the staff well enough before attempting to read music. Thanks for reading!