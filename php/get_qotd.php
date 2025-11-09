<?php
// Enable CORS for frontend fetch requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$db_path = realpath(__DIR__ . '/../backend/db.sqlite3');

if (!file_exists($db_path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Database not found!']);
    exit();
}

try {
    $db = new SQLite3($db_path);

    $query = "SELECT id, question, option_a, option_b, option_c, option_d,
                     correct_option, correct_options, question_type, subject
              FROM api_QOTD
              ORDER BY RANDOM() LIMIT 1";

    $result = $db->query($query);

    if ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        // Decode multi-correct options JSON to PHP array (for frontend use)
        if (!empty($row['correct_options'])) {
            $row['correct_options'] = json_decode($row['correct_options']);
        }
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'No Questions Found']);
    }

    $db->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
