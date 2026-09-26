<?php
declare(strict_types=1);

const ALLOWED_EXTENSIONS = ['txt'];
const UPLOAD_DIRECTORY = '/var/lab-uploads';

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** @param array<string, string> $trace */
function renderPage(string $title, array $trace, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=UTF-8');

    if ($status === 200 && isset($trace['Decisión']) && $trace['Decisión'] === 'aceptar') {
        header('X-Lab-Upload: accepted');
    }

    echo "<!doctype html>\n<html lang=\"es\">\n<head><meta charset=\"utf-8\"><title>"
        . escapeHtml($title) . "</title></head>\n<body>\n";
    echo '<h1>' . escapeHtml($title) . "</h1>\n";
    echo "<dl>\n";

    foreach ($trace as $label => $value) {
        echo '  <dt>' . escapeHtml($label) . '</dt><dd><code>' . escapeHtml($value) . "</code></dd>\n";
    }

    echo "</dl>\n</body>\n</html>\n";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: text/html; charset=UTF-8');
    ?>
<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Traza de carga en PHP</title></head>
  <body>
    <h1>Traza de carga en PHP</h1>
    <form method="post" enctype="multipart/form-data">
      <label>Archivo de texto <input type="file" name="document" accept=".txt" required></label>
      <button type="submit">Enviar archivo de texto</button>
    </form>
  </body>
</html>
<?php
    exit;
}

if (!isset($_FILES['document']) || !is_array($_FILES['document'])) {
    renderPage('Carga rechazada', ['Motivo' => 'El campo document no llegó como archivo.'], 400);
}

$file = $_FILES['document'];
$error = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);

if ($error !== UPLOAD_ERR_OK) {
    renderPage('Carga rechazada', ['Código de PHP' => (string) $error], 400);
}

$clientName = (string) ($file['name'] ?? '');
$temporaryName = (string) ($file['tmp_name'] ?? '');
$baseName = basename($clientName);
$extension = strtolower(pathinfo($baseName, PATHINFO_EXTENSION));

if (!in_array($extension, ALLOWED_EXTENSIONS, true)) {
    renderPage('Carga rechazada', [
        'Nombre recibido' => $clientName,
        'Nombre base' => $baseName,
        'Extensión derivada' => $extension === '' ? '(sin extensión)' : $extension,
        'Decisión' => 'rechazar',
    ], 415);
}

if (!is_dir(UPLOAD_DIRECTORY) || !is_writable(UPLOAD_DIRECTORY)) {
    renderPage('Error del laboratorio', ['Motivo' => 'El directorio de destino no permite escritura.'], 500);
}

$storedName = 'upload-' . bin2hex(random_bytes(8)) . '.' . $extension;
$destination = UPLOAD_DIRECTORY . DIRECTORY_SEPARATOR . $storedName;

if (!move_uploaded_file($temporaryName, $destination)) {
    renderPage('Error del laboratorio', ['Motivo' => 'PHP no pudo mover el archivo temporal.'], 500);
}

renderPage('Carga aceptada', [
    'Nombre recibido' => $clientName,
    'Nombre base' => $baseName,
    'Archivo temporal de PHP' => basename($temporaryName),
    'Extensión derivada' => $extension,
    'Decisión' => 'aceptar',
    'Nombre asignado por el servidor' => $storedName,
    'Directorio de destino' => UPLOAD_DIRECTORY,
]);
