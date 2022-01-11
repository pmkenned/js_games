<?php

$servername = "localhost";
$dbUsername = "paulkenn_admin";
$dbPassword = getenv('DBPW');
$dbName = "paulkenn_testdb";

$conn = mysqli_connect($servername, $dbUsername, $dbPassword, $dbName);

if(!$conn) {
    die("Connection failed: ".mysqli_connect_error());
}

?>
