<?php
header('Access-Control-Allow-Origin: http://localhost:9000');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include("../../const.php");
require("../../auth/VerifyToken.php");

$token = verifyToken($key);

if (array_key_exists('error', $token)) {
  echo json_encode ($token);
  exit;
}

echo json_encode(['token_data' => $token]);
