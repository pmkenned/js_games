let drawCardIsSelected = false;
let discardIsSelected = false;

let players = [];

let createdPlayerTables = false;

let mobileTableIdx = 0;

function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

if (detectMob()) {
    $('#msgDiv').css('font-size', '1.1em');
}

function leftTableBtn(numPlayers)
{
    mobileTableIdx++;
    mobileTableIdx = mobileTableIdx % numPlayers;
    getGameState();
}

function rightTableBtn(numPlayers)
{
    if (mobileTableIdx == 0) {
        mobileTableIdx = numPlayers-1;
    } else {
        mobileTableIdx--;
    }
    getGameState();
}

function renderGameState(game_state)
{
    //$('#echoBtnDiv').css('display', 'block');
    if (game_state == "") {
        $('#playerList').empty();
        //$('#msgDiv').html('<p>No game yet exists.</p>');
        $('#msgDiv').css('display', 'none');
        $('#menuHeader').html('<p>No game yet exists.</p>');
        $('#menuHeader').css('display', 'block');
        //$('#newBtn').css('display', 'inline');
        $('#newBtnDiv').css('display', 'block');
        $('#startGame').css('display', 'none');
        $('#nextRoundDiv').css('display', 'none');
        $('#cancelGame').css('display', 'none');
        $('#endGame').css('display', 'none');
        $('#joinBtnDiv').css('display', 'none');
        $('#scoreDiv').css('display', 'none');
        $('#leaveGameDiv').css('display', 'none');
        $('#draw_and_discard').css('display', 'none');

        if (createdPlayerTables) {
            $('.playerTable').remove();
            createdPlayerTables = false;
        }

    } else {
        $('#newBtnDiv').css('display', 'none');
        $('#scoreDiv').css('display', 'none');
        //console.log(game_state);
        $('#msgDiv').html('');
        $('#msgDiv').css('display', 'block');

        let parsed_data = null;
        try {
            parsed_data = JSON.parse(game_state);
        } catch(err) {
            console.log('error parsing response from server');
            return;
        }

        const is_host = parsed_data.host == player_name;
        const in_game = parsed_data.players.includes(player_name);
        const mode = parsed_data.mode;
        const round = parsed_data.round;

        if (mode == 'waiting_for_players') {

            $('#menuHeader').html('<p>A Game Has Been Created</p>');
            $('#menuHeader').css('display', 'block');
            //$('#msgDiv').html('<p>A game has been created</p>');
            $('#playerList').css('display', 'block');

            let updateList = false;
            for (let player of parsed_data.players) {
                if (!players.includes(player)) {
                    players.push(player);
                    updateList = true;
                }
            }
            for (let player of players) {
                if (!parsed_data.players.includes(player)) {
                    players = players.filter(function(value, index, arr){ return value != player;});
                    updateList = true;
                }
            }
            if (updateList) {
                $('#playerList').empty();
                for (let player of players) {
                    $('#playerList').append(`<p>${player}</p>`);
                }
            }

            if (is_host) {
                $('#startGame').css('display', 'block');
                $('#cancelGame').css('display', 'block');
            } else {
                if (in_game) {
                    $('#leaveGameDiv').css('display', 'none'); // TODO: change this to 'block' once implemented
                    $('#joinBtnDiv').css('display', 'none');
                } else {
                    $('#joinBtn').prop('disabled', false);
                    $('#leaveGameDiv').css('display', 'none');
                    $('#joinBtnDiv').css('display', 'block');
                }
            }
        } else if (mode == 'reveal_2' || mode == 'in_round' || mode == 'between_rounds' || mode == 'game_over') {

            $('#menuHeader').css('display', 'none ');
            $('#restartGame').css('display', 'none');

            if (in_game) {
                $('#scoreDiv').css('display', 'block');
            }

            const numPlayers = parsed_data.players.length;

            if (!createdPlayerTables && in_game) {

                for(let p=0; p<numPlayers; p++) {

                    const myIdx = parsed_data.players.indexOf(player_name);
                    const pidx = tableIdxToPlayerIdx(p, myIdx, numPlayers);
                    const player = parsed_data.players[pidx];

                    let $newTable = $(`<table id="table${p}" class="playerTable"></table>`);
                    const $headerRow = $("<tr></tr>");
                    const $leftBtnCell = $(`<td rowspan="3"><button onclick="leftTableBtn(${numPlayers})" class="fancyButton" style="height: 100%; position: absolute; top: 0; left: -20px">&lt;</button></td>`);
                    const $headerCell = $(`<th colspan="3">${player}</th>`);
                    const $rightBtnCell = $(`<td rowspan="3"><button onclick="rightTableBtn(${numPlayers})" class="fancyButton" style="height: 100%; position: absolute; top: 0">&gt;</button></td>`);
                    if (detectMob()) {
                        $headerRow.append($leftBtnCell);
                    }
                    $headerRow.append($headerCell);
                    if (detectMob()) {
                        $headerRow.append($rightBtnCell);
                    }
                    $newTable.append($headerRow);
                    for(let i=0; i<2; i++) {
                        const $newRow = $("<tr></tr>");
                        for(let j=0; j<3; j++) {
                            const cardIdx = i*3+j;
                            //let $newImg = $(`<img src="images/card_back.png" width="${imgWidth}" />`);
                            const $newImg = $(`<img src="images/card_back.png" />`);
                            if (p==0) {
                                $newImg.click(function() {handCard(cardIdx)});
                                $newImg.attr('id', `card${cardIdx}`);
                                $newImg.css('height', '15vh');
                            } else {
                                $newImg.attr('id', `p${p}card${cardIdx}`);
                                if (detectMob()) {
                                    $newImg.css('height', '15vh');
                                } else {
                                    $newImg.css('height', '10vh');
                                }
                            }
                            let $newTD = $("<td></td>");
                            $newTD.append($newImg);
                            $newRow.append($newTD);
                        }
                        $newTable.append($newRow);
                    }
                    if (detectMob()) {
                        $newTable.css('display', 'none');
                    }
                    $('body').append($newTable);
                }

                $('#table0').css('position', 'fixed');
                $('#table0').css('left', '50vw');
                $('#table0').css('bottom', '10px');
                $('#table0').css('margin-left', '-150px');
                $('#table0').css('border', '4px solid transparent');

                if (detectMob()) {
                    for (let p=1; p<numPlayers; p++) {
                        $(`#table${p}`).css('position', 'fixed');
                        $(`#table${p}`).css('left', '50vw');
                        $(`#table${p}`).css('bottom', '10px');
                        $(`#table${p}`).css('margin-left', '-150px');
                        $(`#table${p}`).css('border', '4px solid transparent');
                    }
                } else {
                    if (numPlayers == 2) {
                        $('#table1').css('position', 'fixed');
                        $('#table1').css('left', '50vw');
                        $('#table1').css('top', '10px');
                        $('#table1').css('margin-left', '-92px');
                    } else if (numPlayers == 3) {
                        $('#table1').css('position', 'fixed');
                        $('#table1').css('left', '10px');
                        $('#table1').css('top', '50vh');
                        $('#table1').css('margin-top', '-92px');
                        $('#table1').css('transform', 'rotate(90deg)');

                        $('#table2').css('position', 'fixed');
                        $('#table2').css('right', '10px');
                        $('#table2').css('top', '50vh');
                        $('#table2').css('margin-top', '-92px');
                        $('#table2').css('transform', 'rotate(-90deg)');
                    } else if (numPlayers == 4) {
                        $('#table1').css('position', 'fixed');
                        $('#table1').css('left', '10px');
                        $('#table1').css('top', '50vh');
                        $('#table1').css('margin-top', '-92px');
                        $('#table1').css('transform', 'rotate(90deg)');

                        $('#table2').css('position', 'fixed');
                        $('#table2').css('left', '50vw');
                        $('#table2').css('top', '10px');
                        $('#table2').css('margin-left', '-92px');

                        $('#table3').css('position', 'fixed');
                        $('#table3').css('right', '10px');
                        $('#table3').css('top', '50vh');
                        $('#table3').css('margin-top', '-92px');
                        $('#table3').css('transform', 'rotate(-90deg)');
                    } else if (numPlayers == 5) {
                        $('#table1').css('position', 'fixed');
                        $('#table1').css('left', '10px');
                        $('#table1').css('top', '50vh');
                        $('#table1').css('margin-top', '-92px');
                        $('#table1').css('transform', 'rotate(90deg)');

                        $('#table2').css('position', 'fixed');
                        $('#table2').css('left', '33vw');
                        $('#table2').css('top', '10px');
                        $('#table2').css('margin-left', '-92px');

                        $('#table3').css('position', 'fixed');
                        $('#table3').css('left', '66vw');
                        $('#table3').css('top', '10px');
                        $('#table3').css('margin-left', '-92px');

                        $('#table4').css('position', 'fixed');
                        $('#table4').css('right', '10px');
                        $('#table4').css('top', '50vh');
                        $('#table4').css('margin-top', '-92px');
                        $('#table4').css('transform', 'rotate(-90deg)');
                    } else if (numPlayers == 6) {
                        $('#table1').css('position', 'fixed');
                        $('#table1').css('left', '10px');
                        $('#table1').css('top', '66vh');
                        $('#table1').css('margin-top', '-92px');
                        $('#table1').css('transform', 'rotate(90deg)');

                        $('#table2').css('position', 'fixed');
                        $('#table2').css('left', '10px');
                        $('#table2').css('top', '33vh');
                        $('#table2').css('margin-top', '-92px');
                        $('#table2').css('transform', 'rotate(90deg)');

                        $('#table3').css('position', 'fixed');
                        $('#table3').css('left', '50vw');
                        $('#table3').css('top', '10px');
                        $('#table3').css('margin-left', '-92px');

                        $('#table4').css('position', 'fixed');
                        $('#table4').css('right', '10px');
                        $('#table4').css('top', '33vh');
                        $('#table4').css('margin-top', '-92px');
                        $('#table4').css('transform', 'rotate(-90deg)');

                        $('#table5').css('position', 'fixed');
                        $('#table5').css('right', '10px');
                        $('#table5').css('top', '66vh');
                        $('#table5').css('margin-top', '-92px');
                        $('#table5').css('transform', 'rotate(-90deg)');
                    } else if (numPlayers == 7) {
                        //$('#table1').css('', '');
                    } else {
                    }
                }

                createdPlayerTables = true;
            }

            if (detectMob()) {
                for(let p=0; p<numPlayers; p++) {
                    if (p == mobileTableIdx) {
                        $(`#table${p}`).css('display', 'initial');
                    } else {
                        $(`#table${p}`).css('display', 'none');
                    }
                }
            }

            const hands = parsed_data.hands;
            const hand = parsed_data.hands[player_name];
            const discard = parsed_data.discard;
            const draw_card = parsed_data.draw_card;
            const scores = parsed_data.scores;
            const your_score = scores[player_name];

            if (mode == 'between_rounds') {
                if (is_host) {
                    $('#nextRoundDiv').css('display', 'block');
                    //$('#nextRoundDiv').css('position', 'fixed');
                    //$('#nextRoundDiv').css('left', '0');
                }
                $('#msgDiv').html(`<p>Round ${round} is over.</p>`);
                $('#table0').css('border', '4px solid transparent');
            } else if (mode == 'game_over') {
                if (is_host) {
                    $('#restartGame').css('display', 'block');
                }
                $('#nextRoundDiv').css('display', 'none');
                if (is_host) {
                    // TODO: create start new game button that starts a new game with the current players
                    //$('#startNewGame').css('display', 'block');
                }

                $('#table0').css('border', '4px solid transparent');

                //  TODO: handle a tie
                let winner = player_name;
                let winner_points = your_score;
                for (let player in scores) {
                    let player_score = scores[player];
                    if (player_score < winner_points) {
                        winner = player;
                        winner_points = player_score;
                    }
                }

                $('#msgDiv').html(`<p>Game is over! ${winner} is the winner with ${winner_points} points!</p>`);
            } else {

                if (mode == 'reveal_2' && in_game) {
                    $('#msgDiv').html('<p>Waiting for all players to reveal 2 cards...</p>');
                }

                if (is_host) {
                    $('#nextRoundDiv').css('display', 'none');
                }

                const is_turn = parsed_data.current_players_turn == player_name;
                const playerIdx = parsed_data.players.indexOf(parsed_data.current_players_turn);
                const myIdx = parsed_data.players.indexOf(player_name);
                const tableIdx = playerIdxToTableIdx(myIdx, playerIdx, parsed_data.players.length);

                for(let p=0; p<parsed_data.players.length; p++) {
                    $(`#table${p}`).css('border', '4px solid transparent');
                }

                if (is_turn) {
                    if (mode != 'reveal_2') {
                        //$('#msgDiv').html('<p>It is your turn</p>');
                        $('#table0').css('border', '4px solid hsl(180, 80%, 50%)');
                        $('#table0').css('border-radius', '16px');

                    }
                } else {
                    if (drawCardIsSelected) { toggle_draw(); }
                    if (discardIsSelected) { toggle_discard(); }
                    if (mode != 'reveal_2') {
                        //$('#msgDiv').html('<p>It is not your turn</p>');
                        // TODO: highlight border of player whose turn it is
                        $(`#table${tableIdx}`).css('border', '4px solid hsl(180, 80%, 50%)');
                        $(`#table${tableIdx}`).css('border-radius', '16px');
                    }
                    $('#table0').css('border', '4px solid transparent');
                }
            }

            $('#scoreSpan').html(`${your_score}`);

            $('#playerList').css('display', 'none');
            if (is_host) {
                $('#endGame').css('display', 'block');
                $('#startGame').css('display', 'none');
                $('#cancelGame').css('display', 'none');
            } else {
                $('#joinBtnDiv').css('display', 'none');
            }

            if (in_game) {
                if (!is_host) {
                    // TODO: consider making it impossible to leave a game once it is started
                    $('#leaveGameDiv').css('display', 'none'); // TODO: change this back to 'block' once leaving is implemented
                }
                $('#draw_and_discard').css('display', 'block');

                //$('#discardBtn').html(getCardName(discard));
                const discardFilename = getCardFileName(discard);
                const discard_bg_url = `images/${discardFilename}`;
                //$(`#discardBtn`).css('background', `url(${discard_bg_url})`);
                //$(`#discardBtn`).css('background-size', 'contain');
                $(`#discardBtn`).prop('src', discard_bg_url);

                if (draw_card) {
                    //$('#drawBtn').html(getCardName(draw_card));
                    const cardFilename = getCardFileName(draw_card);
                    const bg_url = `images/${cardFilename}`;
                    //$(`#drawBtn`).css('background', `url(${bg_url})`);
                    //$(`#drawBtn`).css('background-size', 'contain');
                    $(`#drawBtn`).prop('src', bg_url);

                } else {
                    //$('#drawBtn').html('Draw');
                    //$(`#drawBtn`).css('background', 'url(images/card_back.png)');
                    //$(`#drawBtn`).css('background-size', 'contain');
                    $(`#drawBtn`).prop('src', 'images/card_back.png');
                }
                hand.forEach(function (cardValue, i) {
                    if (cardValue >= 0) {
                        const cardFilename = getCardFileName(cardValue);
                        const bg_url = `images/${cardFilename}`;
                        //$(`#hand${i}Btn`).css('background', `url(${bg_url})`);
                        //$(`#hand${i}Btn`).css('background-size', 'contain');
                        $(`#card${i}`).prop('src', bg_url);
                    } else {
                        //$(`#hand${i}Btn`).css('background', 'url(images/card_back.png)');
                        //$(`#hand${i}Btn`).css('background-size', 'contain');
                        $(`#card${i}`).prop('src', 'images/card_back.png');
                    }
                    //const buttonText = (cardValue < 0) ? '&nbsp;' : getCardName(cardValue);
                    //const buttonText = '&nbsp;';
                    //$(`#hand${i}Btn`).html(buttonText);
                });

                const myIdx = parsed_data.players.indexOf(player_name);
                parsed_data.players.forEach(function (player, playerIdx) {
                    if (player != player_name) {
                        const idx = playerIdxToTableIdx(myIdx, playerIdx, parsed_data.players.length);
                        let playerHand = parsed_data.hands[player];
                        playerHand.forEach(function (cardValue, cardIdx) {
                            if (cardValue >= 0) {
                                const cardFilename = getCardFileName(cardValue);
                                const bg_url = `images/${cardFilename}`;
                                $(`#p${idx}card${cardIdx}`).prop('src', bg_url);
                            } else {
                                $(`#p${idx}card${cardIdx}`).prop('src', 'images/card_back.png');
                            }
                        });
                    }
                });


            } else {
                //$('#msgDiv').html('<p>A game is in progress.</p>');
                $('#menuHeader').html('<p>A game is in progress.</p>');
                $('#menuHeader').css('display', 'block');
                $('#draw_and_discard').css('display', 'none');
            }
        } else {
            console.log(`ERROR: unknown game mode '${mode}'`);
        }
    }
}

function tableIdxToPlayerIdx(myIdx, tableIdx, numPlayers)
{
    let x = (myIdx + tableIdx) % numPlayers;
    return x;
}

function playerIdxToTableIdx(myIdx, playerIdx, numPlayers)
{
    let x = playerIdx - myIdx;
    if (x < 0) {
        x += numPlayers;
    }
    return x;
}

function newGame()
{
    $.get( "gameFunctions.php", { func: 'newGame' } )
    .done(function( data ) {
        console.log('New game: ' + data);
        getGameState();
    });
}

function startGame()
{
    $('#startBtn').prop('disabled', true);
    $.get( "gameFunctions.php", { func: 'startGame' } )
    .done(function( data ) {
        console.log('Started game: ' + data);
        getGameState();
    });
}

function cancelGame()
{
    $.get( "gameFunctions.php", { func: 'cancelGame' } )
    .done(function( data ) {
        console.log('Canceled game: ' + data);
        getGameState();
    });
}

function endGame()
{
    $('#startBtn').prop('disabled', false);
    $.get( "gameFunctions.php", { func: 'endGame' } )
    .done(function( data ) {
        console.log('Ended game: ' + data);
        getGameState();
    });
}

function nextRound()
{
    $.get( "gameFunctions.php", { func: 'nextRound' } )
    .done(function( data ) {
        console.log('Started next round: ' + data);
        getGameState();
    });
}

function joinGame()
{
    $('#joinBtn').prop('disabled', true);
    $('#leaveBtn').prop('disabled', false);
//    $.get( "joinGame.php", { } )
    $.get( "gameFunctions.php", { func: 'joinGame' } )
    .done(function( data ) {
        console.log('Joined game: ' + data);
        getGameState();
    });
}

function leaveGame()
{
    $('#joinBtn').prop('disabled', false);
    $('#leaveBtn').prop('disabled', true);
    $.get( "gameFunctions.php", { func: "leaveGame" } )
    .done(function( data ) {
        console.log('Left game: ' + data);
        getGameState();
    });
}

function toggle_draw()
{
    if (drawCardIsSelected) {
        $('#drawBtn').css('border', '4px solid transparent');
        drawCardIsSelected = false;
    } else {
        $('#drawBtn').css('border', '4px solid red');
        drawCardIsSelected = true;
    }
}

function draw()
{
    $.get("gameFunctions.php", { func: 'revealDrawCard' })
    .done(function( data ) {
        console.log('drew card: ' + data);
        toggle_draw();
        getGameState();
    });
}

function toggle_discard()
{
    // toggle highlight of discard card
    if (discardIsSelected) {
        $('#discardBtn').css('border', '4px solid transparent');
        discardIsSelected = false;
    } else {
        $('#discardBtn').css('border', '4px solid red');
        discardIsSelected = true;
    }
}

function discard_button()
{
    if (drawCardIsSelected) {
        $.get( "gameFunctions.php", { func: 'discardDrawCard' } )
        .done(function( data ) {
            console.log('discarded draw card: ' + data);
            toggle_draw();
            getGameState();
        });
    } else {
        toggle_discard();
    }
}

function handCard(cardIdx)
{
    if (discardIsSelected) {
        $.get( "gameFunctions.php", { func: 'swapDiscardWith', cardIdx: cardIdx} )
        .done(function( data ) {
            console.log('swapped discard with hand card: ' + data);
            toggle_discard();
            getGameState();
        });
    } else if (drawCardIsSelected) {
        $.get( "gameFunctions.php", { func: 'swapDrawWith', cardIdx: cardIdx} )
        .done(function( data ) {
            console.log('swapped draw card with hand card: ' + data);
            toggle_draw();
            getGameState();
        });
    } else {
        $.get( "gameFunctions.php", { func: 'revealCard', cardIdx: cardIdx} )
        .done(function( data ) {
            console.log('revealed card: ' + data);
            getGameState();
        });
    }
}

function echoGameState() {
    $.get( "gameFunctions.php", { func: 'getGameState' } )
    .done(function( data ) {
        parsed_data = JSON.parse(data);
        console.log(parsed_data);
    });
}

// periodically invokes PHP to get game state
function getGameState() {
    $.get( "gameFunctions.php", { func: 'getGameState' } )
    .done(function( data ) {
        renderGameState(data);
    });
}
getGameState();
setInterval(() => {getGameState()}, 2000);

// helper functions

function getSuit(cardValue)
{
    const cardMod52 = (cardValue % 52);
    let suit = '';
    if      (cardMod52 < 13)    { suit = 'Hearts'; }
    else if (cardMod52 < 26)    { suit = 'Clubs'; }
    else if (cardMod52 < 39)    { suit = 'Diamonds'; }
    else                        { suit = 'Spades'; }
    return suit;
}

function getRank(cardValue)
{
    return (cardValue % 13) + 1;
}

function getRankName(cardValue)
{
    const rank = getRank(cardValue);
    let rankName = '';
    if      (rank == 1)     { rankName = 'Ace'; }
    else if (rank == 11)    { rankName = 'Jack'; }
    else if (rank == 12)    { rankName = 'Queen'; }
    else if (rank == 13)    { rankName = 'King'; }
    else                    { rankName = getRank(cardValue); }
    return rankName;
}

function getCardName(cardValue)
{
    return getRankName(cardValue) + ' of ' + getSuit(cardValue);
}

function getCardFileName(cardValue)
{
    const rankName = getRankName(cardValue);
    const rank = getRank(cardValue);
    const rankPart = (rank != 1 && rank < 11) ? rank : rankName.substr(0,1);
    const suit = getSuit(cardValue);
    const suitPart = suit.substring(0,1);
    return rankPart + suitPart + '.png';
}

