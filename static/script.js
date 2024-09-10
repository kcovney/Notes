// flashcard functionality on music literacy page

// wait until webpage is loaded to run script
document.addEventListener('DOMContentLoaded', function() {

    // global variables
    const stopwatch = document.querySelector('#stopwatch');
    const average = document.querySelector('#average');
    const score_display = document.querySelector('#score');
    const incorrect = document.querySelector('#incorrect_tally');
    const notes_identified = document.querySelector('#notes_identified');
    const staff_pictures = document.querySelector('#staff_pictures');
    const start_button = document.querySelector('#start_button');
    const stop_button = document.querySelector('#stop_button');
    const toggle = document.querySelector('#clef_switch');
    const widget = document.querySelector('.console');
    const note_buttons = document.querySelector('.note_buttons');
    const A_button = document.querySelector('#A_button');
    const B_button = document.querySelector('#B_button');
    const C_button = document.querySelector('#C_button');
    const D_button = document.querySelector('#D_button');
    const E_button = document.querySelector('#E_button');
    const F_button = document.querySelector('#F_button');
    const G_button = document.querySelector('#G_button');

    // timer
    let [milliseconds, seconds, minutes] = [0, 0, 0];
    let int = null;
    let timer_flag = false;

    // average
    let correct_tally = 0;
    let incorrect_tally = 0;
    let total_time = 0.00;
    var average_time;

    // flags to determine correct answer
    let [A_flag, B_flag, C_flag, D_flag, E_flag, F_flag, G_flag] = [false, false, false, false, false, false, false];

    let sent_flag = false;
    let treble_flag = true;

    // list of notes
    let treble_note_list = ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
    let bass_note_list = ['C1', 'D1', 'E1', 'F1', 'G1', 'A1', 'B1', 'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3'];

    // number of note pictures
    let picture_count = treble_note_list.length;

    // function to generate a random note picture
    function random_note(){

        // get random number between 0 and the total number of pictures, store in variable random_number
        let random_number = Math.floor(picture_count * Math.random());

        let note_name = treble_note_list[random_number];

        // index into note list using random number, store note name (e.g. 'A2') in variable note_name
        if (treble_flag === false) {
            note_name = bass_note_list[random_number];
        }

        // increment the number of correct answers
        correct_tally++;

        // update average
        update_average();

        // set all flags to false
        [A_flag, B_flag, C_flag, D_flag, E_flag, F_flag, G_flag] = [false, false, false, false, false, false, false];

        // set corresponding flag to true
        if (note_name[0] == 'A'){
            A_flag = true;
        }
        else if (note_name[0] == 'B'){
            B_flag = true;
        }
        else if (note_name[0] == 'C'){
            C_flag = true;
        }
        else if (note_name[0] == 'D'){
            D_flag = true;
        }
        else if (note_name[0] == 'E'){
            E_flag = true;
        }
        else if (note_name[0] == 'F'){
            F_flag = true;
        }
        else {
            G_flag = true;
        }

        if (treble_flag === true) {
            return `static/staff_pictures/treble_clef/${note_name}.png`;
        } else {
            return `static/staff_pictures/bass_clef/${note_name}.png`;
        }
    }

    function displayTimer(){
        milliseconds += 10;
        if (milliseconds == 1000)
        {
            milliseconds = 0;
            seconds++;
            if (seconds == 60)
            {
                seconds = 0;
                minutes++;
            }
        }

        // update total time
        total_time = (milliseconds / 1000) + seconds + (minutes * 60);
        let m = minutes < 10 ? "0" + minutes : minutes;
        let s = seconds < 10 ? "0" + seconds : seconds;
        let ms = milliseconds < 10 ? "00" : milliseconds < 100 ? milliseconds : Math.round(milliseconds/10);

        stopwatch.innerHTML = `${m}:${s}:${ms}`;

        // Stopwatch function adapted from Shantanu Jana https://www.foolishdeveloper.com/2021/10/simple-stopwatch-using-javascript.html
    }

    function update_average(){

        // update correct-note counter
        notes_identified.innerHTML = `correct: ${correct_tally - 1}`;

        // define average time as total run time divided by number of notes correctly identified, fixed to 2 decimal places
        average_time = (total_time/(correct_tally - 1)).toFixed(2);

        // define score as
        score = Math.round(((10 * correct_tally) - (5 * incorrect_tally)) / average_time)

        if (score < 0){
            score = 0;
        }

        // if at least one note has been identified
        if (correct_tally > 0)
        {
            // update and display average to the nearest 100th of a second
            score_display.innerHTML = `score: ${score}`;

            if (score < 10)
            {
                // make widget red
                widget.style.backgroundColor = '#FFCCCC';
                note_buttons.style.backgroundColor = '#FFCCCC';
            }
            else if (score > 10 && score < 30)
            {
                // make widget yellow
                widget.style.backgroundColor = '#FFFFCC';
                note_buttons.style.backgroundColor = '#FFFFCC';
            }
            else if (score > 30)
            {
                // make widget green
                widget.style.backgroundColor = '#CCFFCC';
                note_buttons.style.backgroundColor = '#CCFFCC';
            }
        }
    }

    // when the stop button is clicked
    stop_button.addEventListener('click', function(){

        // if user didn't play, don't send data
        if (score == undefined || score == null) {
            return;
        }

        // convert user data to JSON and store in user_data
        user_data = JSON.stringify({'average_time': parseFloat(average_time), 'correct_tally': correct_tally - 1, incorrect_tally, score})

        // send data to server
        async function sendData() {
            // const response = await fetch('https://kcovney-code50-88935662-v6rrw4ww92xx97-5000.preview.app.github.dev/user_data', {method: 'POST', body: user_data});
            const response = await fetch('http://127.0.0.1:5000/user_data', {method: 'POST', body: user_data});
            const blob = await response.blob();
            sent_flag = true;
        };

        // if user not already pressed stop in current play (to avoid resending user_data)
        if (sent_flag == false) {
            sendData();
        }

        // stop the timers
        clearInterval(int);
        timer_flag = false;

    })

    // when the start button is clicked
    start_button.addEventListener('click', function(){

        // reset counters
        [milliseconds, seconds, minutes] = [0, 0, 0];
        correct_tally = 0;
        incorrect_tally = 0;
        total_time = 0;

        // display random picture
        staff_pictures.src = random_note();

        // cancel displayTimer and start the timer
        clearInterval(int);
        int = setInterval(displayTimer,10);
        timer_flag = true;
        sent_flag = false;

        // reset HTML elements
        score_display.innerHTML = "score: 0";
        incorrect.innerHTML = "incorrect: 0";
        widget.style.backgroundColor = '#DDDDDD';
        note_buttons.style.backgroundColor = '#DDDDDD';
    })


    // when toggle switch is clicked
    toggle.addEventListener('change', function(){

        // if user selects bass clef
        if (treble_flag === true) {
            // show an empty bass staff, set flag, and update picture count
            staff_pictures.src = "static/staff_pictures/bass_clef/empty.png"
            treble_flag = false
            picture_count = bass_note_list.length;
        } else {
            // show an empty treble staff, set flag, and update picture count
            staff_pictures.src = "static/staff_pictures/treble_clef/empty.png"
            treble_flag = true
            picture_count = treble_note_list.length;
        }
    })


    // --------------- keyboard listener ---------------

    // listen for keyboard presses
    document.addEventListener('keydown', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if ((A_flag == true && event.keyCode == 65) ||
                (B_flag == true && event.keyCode == 66) ||
                (C_flag == true && event.keyCode == 67) ||
                (D_flag == true && event.keyCode == 68) ||
                (E_flag == true && event.keyCode == 69) ||
                (F_flag == true && event.keyCode == 70) ||
                (G_flag == true && event.keyCode == 71))
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else if ((A_flag != true && event.keyCode == 65) ||
                    (B_flag != true && event.keyCode == 66) ||
                    (C_flag != true && event.keyCode == 67) ||
                    (D_flag != true && event.keyCode == 68) ||
                    (E_flag != true && event.keyCode == 69) ||
                    (F_flag != true && event.keyCode == 70) ||
                    (G_flag != true && event.keyCode == 71))
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
            // if user presses the space bar
            else if (event.keyCode == 32) {
                event.preventDefault();
            }
        }
    })

    // --------------- button listeners ---------------

    A_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (A_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    B_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (B_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    C_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (C_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    D_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (D_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    E_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (E_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    F_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (F_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
    G_button.addEventListener('click', function(){
        // if timer is running
        if (timer_flag == true)
        {
            // if user is correct
            if (G_flag == true)
            {
                // display random picture
                staff_pictures.src = random_note();
            }
            // if user is incorrect
            else
            {
                // update incorrect-note counter
                incorrect_tally++;
                incorrect.innerHTML = `incorrect: ${incorrect_tally}`;
            }
        }
    })
});