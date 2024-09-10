# allows users to play a note-learning minigame, register, log in and out, and see a rank of high scores

# for interacting with the operating system, os.environ.get()
import os

# for parsing user data
import json

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

from helpers import apology, login_required

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///notes.db")


@app.route("/")
@login_required
def index():
    """allow users to play"""

    return render_template("index.html")


@app.route("/user_data", methods=["POST"])
@login_required
def user_data():
    """Recieves user data from widget"""

    # store user data in dictionary
    user_data = json.loads(request.data)

    timestamp = datetime.now().strftime("%a, %b %d %Y, %I:%M %p")

    # insert user_data into database
    db.execute("INSERT INTO scores (correct, incorrect, sec_per_note, score, timestamp, user_id) VALUES(?, ?, ?, ?, ?, ?)", user_data['correct_tally'], user_data['incorrect_tally'], user_data['average_time'], user_data['score'], timestamp, session["user_id"])

    # get user's high_score
    high_score = (db.execute("SELECT high_score FROM users WHERE id = ?", session["user_id"]))[0]['high_score']

    # if current score is the user's highest, update user's high score
    if (user_data['score'] > high_score):
        db.execute("UPDATE users SET high_score = ? WHERE id = ?", user_data['score'], session['user_id'])

    return redirect("/")


@app.route("/leaderboard")
@login_required
def leaderboard():
    """Show users leaderboard"""

    # get top 10 highest scores and their associated usernames
    high_scores = db.execute("SELECT score, username, timestamp, correct, sec_per_note FROM scores JOIN users ON scores.user_id = users.id ORDER BY score DESC LIMIT 10")

    return render_template("leaderboard.html", high_scores=high_scores)


@app.route("/scores")
@login_required
def scores():
    """Show user scores"""

    # get all scores associated with current user
    scores = db.execute("SELECT score, correct, incorrect, sec_per_note, timestamp FROM scores ORDER BY id DESC LIMIT 150")

    return render_template("scores.html", scores=scores)


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # get form data
    username = request.form.get("username")
    password = request.form.get("password")
    confirmation = request.form.get("confirmation")

    # search for username in db and store in variable db_check
    db_check = db.execute("SELECT username FROM users WHERE username = ?", username)

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # if username is taken
        if len(db_check) > 0:
            return apology("username taken, choose a different one", 400)

        # if any field is left blank
        elif (not password) or (not confirmation) or (not username):
            return apology("fill out all forms", 400)

        # if passwords don't match
        elif (password != confirmation):
            return apology("passwords don't match", 400)

        # hash password
        hash = generate_password_hash(password)

        # insert the user into the users table in the SQL database
        db.execute("INSERT INTO users (username, hash, high_score) VALUES(?, ?, ?)", username, hash, 0)

        # log user in
        session["user_id"] = db.execute("SELECT id FROM users WHERE username = ?", username)[0]['id']

        # Confirm account and redirect user to home page
        flash("Account created!")
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # get form data
    username = request.form.get("username")
    password = request.form.get("password")

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not username:
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not password:
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", username)

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], password):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        flash(f"Hey there, {username}!")
        return redirect("/")

    # if user reached route via GET (as by clicking a link or via redirect)
    return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


# ------------------------------- database -------------------------------


# CREATE TABLE users (
#     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
#     username TEXT NOT NULL,
#     hash TEXT NOT NULL,
#     high_score INTEGER
# );

# CREATE TABLE scores (
#     id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
#     correct INTEGER NOT NULL,
#     incorrect INTEGER NOT NULL,
#     sec_per_note FLOAT NOT NULL,
#     score INTEGER NOT NULL,
#     timestamp CURRENT_TIMESTAMP,
#     user_id INTEGER NOT NULL,
#     FOREIGN KEY(user_id) REFERENCES users(id)
# );

# SELECT * FROM users;
# SELECT * FROM scores;

# DROP TABLE users;
# DROP TABLE scores;

# ALTER TABLE users RENAME COLUMN scores TO high_score;

# ALTER TABLE users DROP COLUMN scores;

# UPDATE users SET high_score = 0 WHERE id = 0;

# top 10 ordered high scores in descending order
# SELECT high_score, username FROM users ORDER BY high_score DESC LIMIT 10;

# top 10 ordered scores in descending order
# SELECT score, username FROM scores JOIN users ON scores.user_id = users.id ORDER BY score DESC LIMIT 10;