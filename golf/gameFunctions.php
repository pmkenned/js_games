<?php
require 'dbh.inc.php';

// TODO: should not be able to access this file directly

session_start();

// TODO: __LINE__ will always be this line; find a work-around
function returnError($msg)
{
    echo 'ERROR: ' . $msg . ' -- ' . __FILE__ . '#' . __LINE__ . "\n";
    exit();
}

if (!isset($_SESSION['userId']) or !isset($_SESSION['username'])) {
    returnError('username not defined');
}

if (isset($_GET['func'])) {

    $func = $_GET['func'];

    switch($func) {
    case 'getGameState':
        getGameState();
        break;
    case 'newGame':
        newGame();
        break;
    case 'cancelGame':
        cancelGame();
        break;
    case 'joinGame':
        joinGame();
        break;
    case 'leaveGame':
        leaveGame();
        break;
    case 'startGame':
        startGame();
        break;
    case 'nextRound':
        nextRound();
        break;
    case 'endGame':
        endGame();
        break;
    case 'revealCard':
        if (isset($_GET['cardIdx'])) {
            $cardIdx = $_GET['cardIdx'];
            revealCard($cardIdx);
        } else {
            returnError('missing cardIdx get parameter');
        }
        break;
    case 'revealDrawCard':
        revealDrawCard();
        break;
    case 'discardDrawCard':
        discardDrawCard();
        break;
    case 'swapDrawWith':
        if (isset($_GET['cardIdx'])) {
            $cardIdx = $_GET['cardIdx'];
            swapDrawWith($cardIdx);
        } else {
            returnError('missing cardIdx get parameter');
        }
        break;
    case 'swapDiscardWith':
        if (isset($_GET['cardIdx'])) {
            $cardIdx = $_GET['cardIdx'];
            swapDiscardWith($cardIdx);
        } else {
            returnError('missing cardIdx get parameter');
        }
        break;
    default:
        returnError('invalid function designation');
        break;
    }

} else {
    returnError('"func" parameter is not set');
}

function getRank($cardValue)
{
    return ($cardValue % 13) + 1;
}

function getCardPointValue($cardValue)
{
    $cardPointValue = 0;
    $rank = getRank($cardValue);
    if ($rank == 11 || $rank == 12) {
        // jacks and queens are 10
        $cardPointValue = 10;
    } else if ($rank == 13) {
        // kings are -2
        $cardPointValue = -2;
    } else if ($rank == 2) {
        // 2 is -2 (TODO: add joker option)
        $cardPointValue = 2;
    } else {
        $cardPointValue = $rank;
    }
    return $cardPointValue;
}

function tallyPoints($game_state_decoded)
{
    foreach ($game_state_decoded->{'players'} as $player) {
        $hand = $game_state_decoded->{'hands'}->{$player};
        $cpv_idx = 0;
        $cpv = [];
        $cr = [];
        foreach ($hand as $cardValue) {
            $cpv[$cpv_idx] = getCardPointValue($cardValue);
            $cr[$cpv_idx] = getRank($cardValue);
            $cpv_idx++;
        }
        // TODO: add option for two -2 cards to cancel to zero
        $col1 = (($cr[0] == $cr[3]) && $cpv[0] != -2) ? 0 : ($cpv[0] + $cpv[3]);
        $col2 = (($cr[1] == $cr[4]) && $cpv[1] != -2) ? 0 : ($cpv[1] + $cpv[4]);
        $col3 = (($cr[2] == $cr[5]) && $cpv[2] != -2) ? 0 : ($cpv[2] + $cpv[5]);
        $total = $col1 + $col2 + $col3;
        // TODO: consider having separate totals per round
        $game_state_decoded->{'scores'}->{$player} += $total;
    }
}

function queryGameState()
{
    global $conn;
    $get_games_query = "SELECT * FROM games";
    $get_games_stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($get_games_stmt, $get_games_query)) {
        returnError('mysqli_stmt_prepare failed');
    } else {
        mysqli_stmt_execute($get_games_stmt);
        $result = mysqli_stmt_get_result($get_games_stmt);
        if ($row = mysqli_fetch_assoc($result)) {
            $game_state_json = $row['game_state'];
        } else {
            $game_state_json = "";
        }
    }
    return $game_state_json;
}

function getHost()
{
    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);
    $host = $game_state_decoded->{'host'};
    return $host;
}

function checkIfWentOut($game_state_decoded)
{
    $current_player = $game_state_decoded->{'current_players_turn'};
    $hand = $game_state_decoded->{'hands'}->{$current_player};
    $all_revealed = true;
    foreach ($hand as $cardValue) {
        if ($cardValue < 0) {
            $all_revealed = false;
        }
    }
    return $all_revealed;
}

function getIndexOfFaceDownCard($game_state_decoded, $player)
{
    $hand = $game_state_decoded->{'hands'}->{$player};
    $idx = 0;
    foreach ($hand as $cardValue) {
        if ($cardValue < 0) {
            break;
        }
        $idx++;
    }
    return $idx;
}

function updateGameState($updated_game_state)
{
    global $conn;
    $join_game_query = "UPDATE games SET game_state = ?";
    $join_game_stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($join_game_stmt, $join_game_query)) {
        returnError('mysqli_stmt_prepare failed');
    } else {
        mysqli_stmt_bind_param($join_game_stmt, "s", $updated_game_state);
        mysqli_stmt_execute($join_game_stmt);
    }
}

function getNextPlayer($game_state_decoded)
{
    $current_player = $game_state_decoded->{'current_players_turn'};
    $players = $game_state_decoded->{'players'};
    $num_players = count($players);
    $current_player_idx = array_search($current_player, $players);
    $next_player_idx = ($current_player_idx + 1) % $num_players;
    $next_player = $players[$next_player_idx];
    return $next_player;
}

function advanceTurnOrEndRound($game_state_decoded)
{
    $current_player = $game_state_decoded->{'current_players_turn'};
    $players = $game_state_decoded->{'players'};
    $num_players = count($players);
    $current_player_idx = array_search($current_player, $players);
    $next_player_idx = ($current_player_idx + 1) % $num_players;
    $next_player = $players[$next_player_idx];
    $who_went_out = $game_state_decoded->{'went_out'};
    $went_out = checkIfWentOut($game_state_decoded);


    if ($who_went_out && $went_out && ($next_player == $who_went_out)) {
        // END ROUND AND/OR GAME
        tallyPoints($game_state_decoded);
        $round = $game_state_decoded->{'round'};
        if ($round < 9) {
            $game_state_decoded->{'mode'} = 'between_rounds';
        } else {
            $game_state_decoded->{'mode'} = 'game_over';
        }
    } else {
        $game_state_decoded->{'current_players_turn'} = $next_player;
    }

    if (!$who_went_out && $went_out) {
       echo $current_player . ' WENT OUT';
       $game_state_decoded->{'went_out'} = $current_player;
    }

    return $game_state_decoded;
}

//function advanceTurn()
//{
//    $game_state_json = queryGameState();
//    $game_state_decoded = json_decode($game_state_json);
//    $current_player = $game_state_decoded->{'current_players_turn'};
//    $players = $game_state_decoded->{'players'};
//    $num_players = count($players);
//    $current_player_idx = array_search($current_player, $players);
//    $current_player_idx = ($current_player_idx + 1) % $num_players;
//    $current_player = $players[$current_player_idx];
//    $game_state_decoded->{'current_players_turn'} = $current_player;
//    $updated_game_state = json_encode($game_state_decoded);
//    updateGameState($updated_game_state);
//}
//

function getNumFaceUpCards($game_state_decoded, $player)
{
    $hand = $game_state_decoded->{'hands'}->{$player};

    $num_face_up_cards = 0;

    foreach ($hand as $cardValue) {
        if ($cardValue >= 0) {
            $num_face_up_cards++;
        }
    }

    return $num_face_up_cards;
}

function checkIfEveryoneHasTwoFaceUp($game_state_decoded)
{
    $all_players_have_two_face_up_cards = true;
    foreach ($game_state_decoded->{'players'} as $player) {
        $num_face_up_cards = getNumFaceUpCards($game_state_decoded, $player);
        if ($num_face_up_cards != 2) {
            $all_players_have_two_face_up_cards = false;
            break;
        }
    }
    return $all_players_have_two_face_up_cards;
}

function getGameState()
{
    $game_state_json = queryGameState();
    echo $game_state_json;
}

function newGame()
{
    $game_state_json = queryGameState();
    if ($game_state_json != '') {
        returnError('cannot create new game while a game is in progress');
    }

    global $conn;
    $query = "INSERT INTO games (game_state) VALUES (?)";

    $init_game_state = '{
        "mode": "waiting_for_players",
        "round": null,
        "current_players_turn": null,
        "players": ["'.$_SESSION['username'].'"],
        "draw_deck": [],
        "discard": null,
        "host": "'.$_SESSION['username'].'"
    }';

    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $query)) {
        returnError('mysqli_stmt_prepare failed');
    } else {
        mysqli_stmt_bind_param($stmt, "s", $init_game_state);
        mysqli_stmt_execute($stmt);
    }

}

function cancelGame()
{
    global $conn;
    $query = "DELETE FROM games";

    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $query)) {
        returnError('mysqli_stmt_prepare failed');
    } else {
        mysqli_stmt_execute($stmt);
    }

}

function joinGame()
{
    $game_state_json = queryGameState();
    if ($game_state_json == '') {
        returnError('no game to join');
    }

    $game_state_decoded = json_decode($game_state_json);

    $players = $game_state_decoded->{'players'};

    if (in_array($_SESSION['username'], $players)) {
        echo "Already in game";
        exit();
    } else {
        array_push($game_state_decoded->{'players'}, $_SESSION['username']);
    }

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function leaveGame()
{
    returnError('error: leaveing is not implemented');
}

function _leaveGame()
{
    $game_state_json = queryGameState();

    if ($game_state_json == '') {
        returnError('no game to leave');
    }

    // TODO: check if this player is in the game
    // TODO: if it is this player's turn, advance the turn before removing
    // TODO: delete their hand

    $game_state_decoded = json_decode($game_state_json);
    $players = $game_state_decoded->{'players'};
    if (in_array($_SESSION['username'], $players)) {
        $idx = array_search($_SESSION['username'], $players);
        unset($game_state_decoded->{'players'}[$idx]);
    } else {
        // already not in game
    }
    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function startRound($game_state_decoded, $roundNum)
{
    // TODO: create 'reveal_2' mode
    $game_state_decoded->{'mode'} = 'reveal_2';
    //$game_state_decoded->{'mode'} = 'in_round';
    $game_state_decoded->{'round'} = $roundNum;
    $game_state_decoded->{'draw_card'} = null;
    $game_state_decoded->{'went_out'} = null;

    // choose starting player
    $num_players = count($game_state_decoded->{'players'});
    $current_player_idx = rand(0,$num_players-1);
    $current_player = $game_state_decoded->{'players'}[$current_player_idx];
    $game_state_decoded->{'current_players_turn'} = $current_player;

    $deck = range(0,52*2-1);
    shuffle($deck);

    $game_state_decoded->{'hands'} = new \stdClass;

    foreach ($game_state_decoded->{'players'} as $player) {
        $game_state_decoded->{'hands'}->{$player} = [];
        for ($x = 0; $x < 6; $x++) {
            $draw_card = array_pop($deck);
            $draw_card = ~$draw_card;
            array_push($game_state_decoded->{'hands'}->{$player}, $draw_card);
        }
    }

    $draw_card = array_pop($deck);
    $game_state_decoded->{'draw_deck'} = $deck;
    $game_state_decoded->{'discard'} = $draw_card;
}

function startGame()
{
    $game_state_json = queryGameState();
    if ($game_state_json == '') {
        returnError('no game to start');
    }
    $game_state_decoded = json_decode($game_state_json);
    $host = $game_state_decoded->{'host'};
    if ($_SESSION['username'] != $host) {
        returnError('only the host can start the game');
    }

    // assign score of 0 to all players
    $game_state_decoded->{'scores'} = new \stdClass;
    foreach ($game_state_decoded->{'players'} as $player) {
        $game_state_decoded->{'scores'}->{$player} = 0;
    }

    startRound($game_state_decoded, 1);

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function nextRound()
{
    $game_state_json = queryGameState();
    if ($game_state_json == '') {
        returnError('no game to start');
    }
    $game_state_decoded = json_decode($game_state_json);
    $host = $game_state_decoded->{'host'};
    if ($_SESSION['username'] != $host) {
        returnError('only the host can start the round');
    }

    $roundNum = $game_state_decoded->{'round'} + 1;
    startRound($game_state_decoded, $roundNum);
    echo 'starting next round';

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function endGame()
{
    $host = getHost();
    if ($host != $_SESSION['username']) {
        returnError('only the host can end the game ; host = ' . $host);
    }

    global $conn;
    $query = "DELETE FROM games";

    $stmt = mysqli_stmt_init($conn);
    if (!mysqli_stmt_prepare($stmt, $query)) {
        returnError('mysqli_stmt_prepare failed');
    } else {
        mysqli_stmt_execute($stmt);
    }
}


// player actions

function revealCard($cardIdx)
{
    if ($cardIdx < 0 || $cardIdx > 5) {
        returnError('invalid card index');
    }

    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);

    $uid = $_SESSION['username'];
    $current_player = $game_state_decoded->{'current_players_turn'};
    $mode = $game_state_decoded->{'mode'};
    if (($mode != 'reveal_2') && ($uid != $current_player)) {
        echo 'it is not your turn!';
        exit();
    }

    $num_face_up_cards = getNumFaceUpCards($game_state_decoded, $uid);

    if ($mode == 'reveal_2') {
        if ($num_face_up_cards >= 2) {
            echo 'you cannot reveal any more cards until everyone has turned over two cards';
            exit();
        }
    }

    if ($game_state_decoded->{'draw_card'}) {
        echo 'you must use the draw card!';
        exit();
    }

    $hand = $game_state_decoded->{'hands'}->{$uid};
    $cardValue = $hand[$cardIdx];

    if ($cardValue < 0) {
        $cardValue = ~$cardValue;
        echo $cardValue;
        $game_state_decoded->{'hands'}->{$uid}[$cardIdx] = $cardValue;
        $num_face_up_cards++;
    } else {
        echo 'card already revealed';
        exit();
    }

    if ($mode == 'reveal_2') {
        if (checkIfEveryoneHasTwoFaceUp($game_state_decoded)) {
            $game_state_decoded->{'mode'} = 'in_round';
        }
    }

    $who_went_out = $game_state_decoded->{'went_out'};
    $went_out = checkIfWentOut($game_state_decoded);
    //$next_player = getNextPlayer($game_state_decoded);
    //if ($who_went_out) {
    //    // if someone has gone out, only advance the turn if current player has gone out
    //    if ($went_out) {
    //        if ($next_player == $who_went_out) {
    //            $game_state_decoded->{'mode'} = 'between_rounds';
    //            tallyPoints($game_state_decoded);
    //        } else {
    //            $game_state_decoded->{'current_players_turn'} = $next_player;
    //        }
    //    }
    //} else {
    //    if ($went_out) {
    //        echo $current_player . ' WENT OUT';
    //        $game_state_decoded->{'went_out'} = $current_player;
    //    }
    //    $game_state_decoded->{'current_players_turn'} = $next_player;
    //}

    if (!$who_went_out || $went_out) {
        advanceTurnOrEndRound($game_state_decoded);
    }

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function revealDrawCard()
{
    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);

    $mode = $game_state_decoded->{'mode'};
    if ($mode == 'reveal_2') {
        echo 'everyone must first reveal 2 cards';
        exit();
    }

    $uid = $_SESSION['username'];
    if ($uid != $game_state_decoded->{'current_players_turn'}) {
        echo 'it is not your turn!';
        exit();
    }

    if ($game_state_decoded->{'draw_card'}) {
        echo 'you cannot draw more than one card!';
        exit();
    }

    $who_went_out = $game_state_decoded->{'went_out'};

    if ($who_went_out) {
        $hand = $game_state_decoded->{'hands'}->{$uid};
        $num_revealed = 0;
        foreach ($hand as $cardValue) {
            if ($cardValue >= 0) {
                $num_revealed++;
            }
        }
        if ($num_revealed != 5) {
            echo 'you must reveal all but your last card first';
            exit();
        }
    }

    $deck = $game_state_decoded->{'draw_deck'};
    $num_deck_cards = count($deck);

    if ($num_deck_cards > 0) {
        $draw_card = array_pop($game_state_decoded->{'draw_deck'});
        $game_state_decoded->{'draw_card'} = $draw_card;
        echo $draw_card;
    } else {
        // TODO: if draw deck is empty, show that it is empty on the client-side
        // TODO: make sure that once the deck is reshuffled, a card is drawn (or not)
        $new_deck = range(0,52*2-1);

        foreach ($game_state_decoded->{'players'} as $player) {
            echo " ($player)";
            $player_hand = $game_state_decoded->{'hands'}->{$player};
            foreach ($player_hand as $cardValue) {
                if ($cardValue < 0) {
                    $cardValue = ~$cardValue;
                }
                echo "  $cardValue ";
                if (in_array($cardValue, $new_deck)) {
                    $idx = array_search($cardValue, $new_deck);
                    echo " ($idx)";
                    unset($new_deck[$idx]);
                }
            }
        }
        shuffle($new_deck);
        $game_state_decoded->{'draw_deck'} = $new_deck;
    }

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function discardDrawCard()
{
    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);

    $mode = $game_state_decoded->{'mode'};
    if ($mode == 'reveal_2') {
        echo 'everyone must first reveal 2 cards';
        exit();
    }

    $uid = $_SESSION['username'];
    if ($uid != $game_state_decoded->{'current_players_turn'}) {
        echo 'it is not your turn!';
        exit();
    }

    $draw_card = $game_state_decoded->{'draw_card'};

    if ($draw_card == null) {
        echo 'draw card is null!';
        exit();
    }

    $who_went_out = $game_state_decoded->{'went_out'};
    if ($who_went_out) {
        $hand = $game_state_decoded->{'hands'}->{$uid};
        $remaining_card_idx = null;
        $remaining_card_value = null;
        foreach ($hand as $cardValue) {
            if ($cardValue < 0) {
                $remaining_card_idx = array_search($cardValue, $hand);
                $remaining_card_value = ~$cardValue;
            }
        }
        $game_state_decoded->{'hands'}->{$uid}[$remaining_card_idx] = $remaining_card_value;
    }


    $game_state_decoded->{'discard'} = $draw_card;
    $game_state_decoded->{'draw_card'} = null;

    //$next_player = getNextPlayer($game_state_decoded);
    //if ($next_player == $who_went_out) {
    //    $game_state_decoded->{'mode'} = 'between_rounds';
    //    tallyPoints($game_state_decoded);
    //}
    //$game_state_decoded->{'current_players_turn'} = $next_player;

    advanceTurnOrEndRound($game_state_decoded);

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

// TODO: make sure it is possible to swap draw card with face-up card when being
// forced to go out and that this results in the remaining face-up card being
// revealed (is this correct?)
function swapDrawWith($cardIdx)
{
    if ($cardIdx < 0 || $cardIdx > 5) {
        returnError('invalid card index');
    }

    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);

    $mode = $game_state_decoded->{'mode'};
    if ($mode == 'reveal_2') {
        echo 'everyone must first reveal 2 cards';
        exit();
    }

    $uid = $_SESSION['username'];
    $current_player = $game_state_decoded->{'current_players_turn'};
    if ($uid != $current_player) {
        echo 'it is not your turn!';
        exit();
    }

    $draw_card = $game_state_decoded->{'draw_card'};
    if ($draw_card == null) {
        echo 'draw card is null!';
        exit();
    }

    $who_went_out = $game_state_decoded->{'went_out'};

    if ($who_went_out) {
        $hand = $game_state_decoded->{'hands'}->{$uid};
        $num_revealed = getNumFaceUpCards($game_state_decoded, $uid);
        $remaining_card_idx = getIndexOfFaceDownCard($game_state_decoded, $uid);
        if ($num_revealed == 5) {
            if ($cardIdx != $remaining_card_idx) {
                //echo 'you must reveal the last remaining card';
                //exit();
                $remaining_card_value = ~$game_state_decoded->{'hands'}->{$uid}[$remaining_card_idx];
                $game_state_decoded->{'hands'}->{$uid}[$remaining_card_idx] = $remaining_card_value;
            }
        } else {
            echo 'you must reveal all but your last card first';
            exit();
        }
    }

    $cardValue = $game_state_decoded->{'hands'}->{$uid}[$cardIdx];
    if ($cardValue < 0) {
        $cardValue = ~$cardValue;
    }
    $game_state_decoded->{'discard'} = $cardValue;
    $game_state_decoded->{'hands'}->{$uid}[$cardIdx] = $draw_card;
    $game_state_decoded->{'draw_card'} = null;

    //$went_out = checkIfWentOut($game_state_decoded);
    //if ($went_out and !$who_went_out) {
    //    echo $current_player . ' WENT OUT';
    //    $game_state_decoded->{'went_out'} = $current_player;
    //}

    //$next_player = getNextPlayer($game_state_decoded);
    //if ($next_player == $who_went_out) {
    //    $game_state_decoded->{'mode'} = 'between_rounds';
    //    tallyPoints($game_state_decoded);
    //}
    //$game_state_decoded->{'current_players_turn'} = $next_player;

    advanceTurnOrEndRound($game_state_decoded);

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

function swapDiscardWith($cardIdx)
{
    if ($cardIdx < 0 || $cardIdx > 5) {
        returnError('invalid card index');
    }

    $game_state_json = queryGameState();
    $game_state_decoded = json_decode($game_state_json);

    $mode = $game_state_decoded->{'mode'};
    if ($mode == 'reveal_2') {
        echo 'everyone must first reveal 2 cards';
        exit();
    }

    $uid = $_SESSION['username'];
    $current_player = $game_state_decoded->{'current_players_turn'};
    if ($uid != $current_player) {
        echo 'it is not your turn!';
        exit();
    }

    if ($game_state_decoded->{'draw_card'}) {
        echo 'you must use the draw card!';
        exit();
    }

    $hand = $game_state_decoded->{'hands'}->{$uid};

    $who_went_out = $game_state_decoded->{'went_out'};

    if ($who_went_out) {
        $num_revealed = 0;
        foreach ($hand as $cardValue) {
            if ($cardValue >= 0) {
                $num_revealed++;
            }
        }
        if ($num_revealed != 5) {
            echo 'you must reveal all but your last card first';
            exit();
        }
    }

    $discard = $game_state_decoded->{'discard'};
    $cardValue = $hand[$cardIdx];
    if ($cardValue < 0) {
        $cardValue = ~$cardValue;
    }
    $game_state_decoded->{'discard'} = $cardValue;
    $game_state_decoded->{'hands'}->{$uid}[$cardIdx] = $discard;

    $went_out = checkIfWentOut($game_state_decoded);

    if ($who_went_out) {
        if (!$went_out) {
            // didn't go out; must reveal remaining card
            $remaining_card_idx = 0;
            foreach ($hand as $cardValue) {
                if ($cardValue < 0) {
                    $cardValue = ~$cardValue;
                    $game_state_decoded->{'hands'}->{$uid}[$remaining_card_idx] = $cardValue;
                }
                $remaining_card_idx++;
            }
        }
//    } else {
//        if ($went_out) {
//            echo $current_player . ' WENT OUT';
//            $game_state_decoded->{'went_out'} = $current_player;
//        }
    }

    //$next_player = getNextPlayer($game_state_decoded);
    //if ($next_player == $who_went_out) {
    //    $game_state_decoded->{'mode'} = 'between_rounds';
    //    tallyPoints($game_state_decoded);
    //}
    //$game_state_decoded->{'current_players_turn'} = $next_player;

    advanceTurnOrEndRound($game_state_decoded);

    $updated_game_state = json_encode($game_state_decoded);
    updateGameState($updated_game_state);
}

?>
