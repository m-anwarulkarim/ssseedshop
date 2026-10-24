<?php
require_once __DIR__ . '/../db.php';


$tags = DB::all('tags', 'name ASC');
echo json_encode($tags, JSON_UNESCAPED_UNICODE);
?>
