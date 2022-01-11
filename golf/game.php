<?php
session_start();
if (!isset($_SESSION['userId']) or !isset($_SESSION['username'])) {
    header("Location: index.php");
    exit();
}
?><!DOCTYPE html>
<html>

    <head>
        <meta charset="utf-8" />
        <title>Golf</title>
        <meta name="description" content="Golf Card Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" type="text/css" href="style.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.0/jquery.min.js" integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ=" crossorigin="anonymous"></script>
    </head>

    <body>

        <div class="topDiv">
            <div class="alignLeft" id="endGame">
                <button type="button" onclick="endGame()">End Game</button>
            </div>
            <div class="alignLeft" id="leaveGameDiv">
                <button type="button" id="leaveBtn" onclick="leaveGame()">Leave Game</button>
            </div>
            <div class="alignRight">
                <span class="loggedInAs">
<?php
echo 'Logged in as <span class="username">' . $_SESSION['username'] . '</span>';
?>
                </span>
                <form action="logout.inc.php" method="POST"><button type="submit" name="logout-submit">Logout</button></form>
            </div>
        </div>

        <div class="menuDiv">
            <div id="menuHeader"></div>
            <div id="newBtnDiv">    <button type="button" class="fancyButton" id="newBtn"       onclick="newGame()">        New Game</button></div>
            <div id="joinBtnDiv">   <button type="button" class="fancyButton" id="joinBtn"      onclick="joinGame()">       Join Game</button></div>
            <div id="startGame">    <button type="button" class="fancyButton" id="startBtn"     onclick="startGame()">      Start Game</button></div>
            <div id="cancelGame">   <button type="button" class="fancyButton" id="cancelBtn"    onclick="cancelGame()">     Cancel Game</button></div>
            <div id="playerList"></div>
        </div>


        <div id="nextRoundDiv">    <button type="button" class="fancyButton" id="nextBtn"      onclick="nextRound()">      Begin Next Round</button></div>
        <div id="restartGame">     <button type="button" class="fancyButton" id="startNewBtn"  onclick="startGame()">      Start New Game</button></div>
        <div id="msgDiv"></div>
        <div id="scoreDiv">
            <p>Your Score: <span id="scoreSpan"></span></p>
        </div>
        <div id="errorDiv"></div>

        <div id="draw_and_discard">
            <img id="drawBtn" onclick="draw()" src="images/card_back.png" />
            <img id="discardBtn" onclick="discard_button()" src="images/card_back.png" />
        </div>

        <div id="echoBtnDiv">   <button type="button" id="echoBtn"      onclick="echoGameState()">  Echo Game State</button></div>

<script>
<?php
    echo 'const player_name = \'' . $_SESSION['username'] . '\';';
?>
</script>

        <script src="game.js"></script>

    </body>

</html>
