<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
  //  echo json_encode(['success' => true, 'message' => 'Login successful']);
include __DIR__ . '/../../const.php';
$result = mysqli_query($conn, "SELECT * FROM feedback ORDER BY created_at DESC");
$arr = array();
while ($row = mysqli_fetch_assoc($result)) {
    $arr[] = $row;
}

echo json_encode($arr);
