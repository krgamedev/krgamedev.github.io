
// Set up
currentRow = 0;
currentColumn = 0;
finalRow = 0;
board_row = new Array();
hintText = new Array();
for (var i=0; i<7; i++) {
    board_row[i] = [-1, -1, -1, -1];
    hintText[i] = "";
}
solution = [0, 0, 0, 0];
puzzleNumber = 1;
won = 0;
lost = 0;
previouslyFinished = 0;

// Generate a random puzzle
getRandomNumber = function(min, max) {
    max = max || 1;
    min = min || 0;

    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;

    return Math.floor(min + rnd * (max - min));
}
// Create RNG seed based on the current date
var theYear = new Date().getFullYear();
var theMonth = new Date().getMonth()+1;
var theDay = new Date().getDate();
originalSeed = (theYear*10000) + (theMonth*100) + theDay;
console.log("Seed: " + originalSeed.toString());
seed = originalSeed;
// Pull pegs out of a bag with two of each color
var bag = [0, 5, 1, 4, 2, 3, 3, 2, 4, 1, 5, 0];
var p1 = getRandomNumber(0, 12);
solution[0] = bag[p1];
bag.splice(p1, 1);
var p2 = getRandomNumber(0, 11);
solution[1] = bag[p2];
bag.splice(p2, 1);
var p3 = getRandomNumber(0, 10);
solution[2] = bag[p3];
bag.splice(p3, 1);
var p4 = getRandomNumber(0, 9);
solution[3] = bag[p4];
bag.splice(p4, 1);
// Shuffle the pegs
var order = getRandomNumber(0, 8);
if (order == 1) { solution = [solution[3], solution[2], solution[1], solution[0]]; }
else if (order == 2) { solution = [solution[0], solution[1], solution[3], solution[2]]; }
else if (order == 3) { solution = [solution[1], solution[2], solution[3], solution[0]]; }
else if (order == 4) { solution = [solution[2], solution[3], solution[0], solution[1]]; }
else if (order == 5) { solution = [solution[3], solution[0], solution[2], solution[1]]; }
else if (order == 6) { solution = [solution[3], solution[1], solution[0], solution[2]]; }
else if (order == 7) { solution = [solution[0], solution[3], solution[2], solution[1]]; }
// Get puzzle number
var diffMs = new Date(theYear.toString() + "-" + theMonth.toString() + "-" + theDay.toString()) - new Date('2022-1-14');
var diffDays = diffMs / (1000 * 60 * 60 * 24);
puzzleNumber = diffDays+1;


// Print date
var shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var dateString = shortMonth[new Date().getMonth()] + " " + new Date().getDate().toString() + ", " + new Date().getFullYear().toString();
$("#game_date").text('► '+dateString+' ◄');


// Add classes for current row and column
function updateCurrentRowColumn() {
    $('.row').each(function(){
        $(this).removeClass('current');
        if ($(this).data('row') == currentRow) {
            $(this).addClass('current');
        }
    });
    $('.peg').each(function(){
        $(this).removeClass('current');
        if (($(this).data('row') == currentRow) && ($(this).data('column') == currentColumn)) {
            $(this).addClass('current');
        }
    });
}

updateCurrentRowColumn();
loadState();

// Help button
$('#help_button').on('click',function(){
    $('.modal-container').css("display", "flex");
    $('#tutorial').each(function(){
        $(this).css("display", "block");
    });
});
// Stats button
$('#stats_button').on('click',function(){
    $('.modal-container').css("display", "flex");
    $('#stats').each(function(){
        $(this).css("display", "block");
    });
});
// Modal dialog close button
$('.modal .close-button').each(function(){
    $(this).on('click',function(){
        $('.modal-container').css("display", "none");
        $('.modal').each(function(){
            $(this).css("display", "none");
        });
    });
});
// Left and right arrows move the cursor
$("body").keydown(function( event ) {
    if ((!won) && (!lost)) {
        if (event.which == 37) {
            if (currentColumn > 0) {
                currentColumn--;
                updateCurrentRowColumn();
            }
        }
        else if (event.which == 39) {
            if (currentColumn < 3) {
                currentColumn++;
                updateCurrentRowColumn();
            }
        }
    }
});
// Click a peg on the current row to select it
$('.peg').each(function(){
    $(this).on('click',function(){
        if ((!won) && (!lost)) {
            if ($(this).data('row') == currentRow) {
                currentColumn = $(this).data('column');
                updateCurrentRowColumn();
            }
        }
    });
});
$('#buttons .button').each(function(){
    $(this).on('click',function(){
        if ($(this).data('color') == 7) {
            clipWrite();
        }
        if ((!won) && (!lost)) {
            if ($(this).data('color') == 6) {
                guess(board_row[currentRow]);
                if ((!won) && (!lost)) {
                    currentRow++;
                    currentColumn = 0;
                    saveState();
                    $('.peg').each(function(){
                        $(this).removeClass('current');
                    });
                }
                updateCurrentRowColumn();
            }
            else {
                var cc = $(this).data('color');
                board_row[currentRow][currentColumn] = cc;
                $('.row.current .peg').each(function(){
                    if ($(this).data('column') == currentColumn) {
                        $(this).removeClass();
                        $(this).addClass('peg');
                        $(this).addClass('color-'+cc);
                    }
                });
                if (currentColumn < 3) {
                    currentColumn++;
                }
                else {
                    currentColumn = 0;
                }
                updateCurrentRowColumn();
            }
        }
    });
});

// check player's guess against the solution
function guess(pegs) {
    if (pegs.length != 4) {
        console.log('invalid guess');
    }
    else {
        var hits = 0;
        var blows = 0;
        var used = [0, 0, 0, 0];
        
        // check for hits
        for (var i = 0; i <= 3; i++) {
            if (solution[i] == pegs[i]) {
                hits++;
                used[i] = 1;
            }
        }
        
        // check for blows
        var c0 = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        var c4 = 0;
        var c5 = 0;
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var s3 = 0;
        var s4 = 0;
        var s5 = 0;
        for (var i = 0; i <= 3; i++) {
            if (used[i] == 0) {
                if (pegs[i] == 0) { c0++; }
                else if (pegs[i] == 1) { c1++; }
                else if (pegs[i] == 2) { c2++; }
                else if (pegs[i] == 3) { c3++; }
                else if (pegs[i] == 4) { c4++; }
                else if (pegs[i] == 5) { c5++; }
                if (solution[i] == 0) { s0++; }
                else if (solution[i] == 1) { s1++; }
                else if (solution[i] == 2) { s2++; }
                else if (solution[i] == 3) { s3++; }
                else if (solution[i] == 4) { s4++; }
                else if (solution[i] == 5) { s5++; }
            }
        }
        blows += Math.min(c0, s0);
        blows += Math.min(c1, s1);
        blows += Math.min(c2, s2);
        blows += Math.min(c3, s3);
        blows += Math.min(c4, s4);
        blows += Math.min(c5, s5);
        
        var hitString = " correct";
        var blowsString = " color matches";
        if (hits == 1) { hitString = " correct"; }
        if (blows == 1) { blowsString = " color match"; }
        $('#status p').text(hits.toString() + hitString + " / " + blows.toString() + blowsString);
        
        for (var i=0; i<hits; i++) {
            hintText[currentRow] += "🟧";
        }
        for (var i=0; i<blows; i++) {
            hintText[currentRow] += "⬜";
        }
        if (hits+blows < 4) {
            for (var i = 4; i > hits+blows; i--) {
                hintText[currentRow] += "⬛";
            }
        }
        
        // add small pegs
        $('.row.current .small-pegs').html("");
        for (var i = 0; i < hits; i++) {
            $('.row.current .small-pegs').append('<div class="small-peg hit"></div>');
        }
        for (var i = 0; i < blows; i++) {
            $('.row.current .small-pegs').append('<div class="small-peg blow"></div>');
        }
        if (hits+blows < 4) {
            for (var i = 4; i > hits+blows; i--) {
                $('.row.current .small-pegs').append('<div class="small-peg"></div>');
            }
        }
        
        if (hits == 4) {
            won = 1;
            
            finalRow = currentRow;
            
            saveState();
            
            if (!previouslyFinished) {
                if (localStorage.getItem("plays")) {
                    var plays = localStorage.getItem("plays");
                    localStorage.setItem("plays", parseInt(plays)+1);
                }
                else {
                    localStorage.setItem("plays", 1);
                }
                if (localStorage.getItem("wins")) {
                    var wins = localStorage.getItem("wins");
                    localStorage.setItem("wins", parseInt(wins)+1);
                }
                else {
                    localStorage.setItem("wins", 1);
                }
            }
            var plays = parseInt(localStorage.getItem("plays"));
            var wins = parseInt(localStorage.getItem("wins"));
            $("#stats_played").text(plays.toString());
            $("#stats_wins").text(wins.toString());
            $("#stats_winrate").text(((wins/plays)*100).toFixed(2));
            
            $('#status').addClass("good");
            $('body').addClass("gameover");
            $('#status p').text("You got it!");
            
            currentRow = -1;
            currentColumn = -1;
            
            $('.peg').each(function(){
                $(this).removeClass('current');
            });
            
            $('.row.solution .peg').each(function(){
                $(this).addClass('color-'+solution[$(this).data('column')]);
            });
        }
        else if (currentRow == 6) {
            lost = 1;
            
            finalRow = currentRow;
            
            saveState();
            
            if (!previouslyFinished) {
                if (localStorage.getItem("plays")) {
                    var plays = localStorage.getItem("plays");
                    localStorage.setItem("plays", parseInt(plays)+1);
                    console.log(plays + " plays");
                }
                else {
                    localStorage.setItem("plays", 1);
                }
            }
            var plays = parseInt(localStorage.getItem("plays"));
            var wins = parseInt(localStorage.getItem("wins"));
            $("#stats_played").text(plays.toString());
            $("#stats_wins").text(wins.toString());
            $("#stats_winrate").text(((wins/plays)*100).toFixed(2));
            
            $('#status').addClass("bad");
            $('body').addClass("gameover");
            $('#status p').text("Sorry, you lost...");
            currentRow = -1;
            currentColumn = -1;
            $('.row.solution .peg').each(function(){
                $(this).addClass('color-'+solution[$(this).data('column')]);
            });
        }
    }
}

// save the game state to local storage
function saveState() {
    for (var i=0; i<7; i++) {
        localStorage.setItem('row'+i.toString(), board_row[i]);
    }
    localStorage.setItem('game_row', currentRow);
    localStorage.setItem('game_won', won);
    localStorage.setItem('game_lost', lost);
    localStorage.setItem('game_id', originalSeed);
}

// load the game state from local storage
function loadState() {
    if (localStorage.getItem("plays")) {
        var plays = parseInt(localStorage.getItem("plays"));
        var wins = parseInt(localStorage.getItem("wins"));
        $("#stats_played").text(plays.toString());
        $("#stats_wins").text(wins.toString());
        $("#stats_winrate").text(((wins/plays)*100).toFixed(2));
    }
    else {
        localStorage.setItem('plays', '0');
        localStorage.setItem('wins', '0');
    }
    if (localStorage.getItem('game_id')) {
        if (parseInt(localStorage.getItem('game_id')) == originalSeed) {
            previouslyFinished = Math.max(parseInt(localStorage.getItem('game_won')), parseInt(localStorage.getItem('game_lost')));
            for (var i=0; i<7; i++) {
                board_row[i] = localStorage.getItem('row'+i.toString()).split(',');
                board_row[i][0] = parseInt(board_row[i][0]);
                board_row[i][1] = parseInt(board_row[i][1]);
                board_row[i][2] = parseInt(board_row[i][2]);
                board_row[i][3] = parseInt(board_row[i][3]);
                if (board_row[i][0] > -1) {
                    currentRow = i;
                    updateCurrentRowColumn();
                    $('.peg').each(function(){
                        $(this).removeClass('current');
                    });
                    guess([board_row[i][0], board_row[i][1], board_row[i][2], board_row[i][3]]);
                }
            }
            
            $('.row .peg').each(function(){
                if (parseInt($(this).data('row')) < 7) {
                    var pegColor = board_row[parseInt($(this).data('row'))][parseInt($(this).data('column'))];
                    if (pegColor > -1) {
                        $(this).addClass('color-'+pegColor.toString());
                    }
                }
            });
            
            currentRow = parseInt(localStorage.getItem('game_row', currentRow));
            updateCurrentRowColumn();
        }
    }
}

function clipWrite() {
    var clipText = "🥞 Breakfast #" + puzzleNumber.toString() + " ";
    if (lost) {
        clipText += "X/7";
    }
    else {
        clipText += (finalRow+1).toString() + "/7";
    }
    clipText += "\n" + "\n";
    for (var i=0; i<=finalRow; i++) {
        clipText += hintText[i];
        if (i < finalRow) {
            clipText += "\n";
        }
    }
    
    navigator.clipboard.writeText(clipText).then(function() {
        console.log("Copied to clipboard");
        $("#clip_copy").text("Copied to clipboard");
        setTimeout(function(){
            $("#clip_copy").text("Share");
        }, 3000);
    }, function() {
        console.log("Failed to copy to clipboard");
    });
}