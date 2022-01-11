<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="description" content="Create Account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Create Account</title>
        <link rel="stylesheet" type="text/css" href="style.css">
    </head>

    <body class="centerForm">

<!--
TODO: user some javascript to enforce
    * password rules
    * repeated password match
    * available username (will need AJAX database queries)
    * properly formed email address
-->
        <div class="centerForm" id="signupDiv">
<?php
// TODO: upon successful signup, consider automatically log in user
if (isset($_GET['error'])) {
    if ($_GET['error'] == "emptyfields") {
        echo 'You must fill in all fields.';
    } elseif ($_GET['error'] == "invalidmailuid") {
        echo 'Invalid email and username.';
    } elseif ($_GET['error'] == "invalidmail") {
        echo 'Invalid email.';
    } elseif ($_GET['error'] == "invaliduid") {
        echo 'Invalid username.';
    } elseif ($_GET['error'] == "passwordcheck") {
        echo 'Passwords do not match.';
    } elseif ($_GET['error'] == "sqlerror") {
        echo 'Database error.';
    } elseif ($_GET['error'] == "usertaken") {
        echo 'That username is taken.';
    }
} else {
}
?>

            <form action="signup.inc.php" method="POST">
                <input type="text" name="uid" placeholder="Username" />
                <input type="text" name="mail" placeholder="E-mail" />
                <input type="password" name="pwd" placeholder="Password" />
                <input type="password" name="pwd-repeat" placeholder="Repeat password" />
                <button type="submit" name="signup-submit">Sign Up</button>
            </form>
        </div>

    </body>

</html>
