<?php
declare(strict_types=1);

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'desconocido';
$recurso = $_SERVER['REQUEST_URI'] ?? '/';

header('Content-Type: text/html; charset=UTF-8');
header('X-Lab-Renderer: php');

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Respuesta generada por PHP</title>
  </head>
  <body>
    <h1>PHP generó esta respuesta para Apache</h1>
    <p>Método recibido: <code><?= escapeHtml($metodo) ?></code></p>
    <p>Recurso solicitado: <code><?= escapeHtml($recurso) ?></code></p>
  </body>
</html>
