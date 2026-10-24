<?php
require_once __DIR__ . '/../db.php';
$json_file = '../database/tags.json';

$tags = DB::all('tags', 'name ASC');
echo json_encode($tags, JSON_UNESCAPED_UNICODE);
?>
