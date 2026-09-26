# Traza de carga PHP: laboratorio 2

Este laboratorio sigue una carga inocua desde `multipart/form-data` hasta un directorio que no
forma parte del `DocumentRoot`. No contiene un bypass de extensiones, archivos ejecutables ni
acceso al CTF.

## Estructura

```text
conf/php.load          carga el módulo PHP en Apache
conf/docker-php.conf   asigna los archivos .php al manejador PHP
fixtures/              contiene el archivo inocuo para la prueba
public/upload.php      recibe y traza la carga
```

El directorio de destino se crea como un sistema de archivos temporal dentro del contenedor. Así,
el usuario `www-data` puede escribir en él sin depender de permisos del sistema anfitrión.

## Arranque

Desde la raíz del repositorio, el laboratorio se inicia con:

```bash
docker run --rm --name php-upload-trace -p 127.0.0.1:8002:80 \
  -v "$PWD/labs/php-upload-trace/conf/php.load:/etc/apache2/mods-enabled/php.load:ro" \
  -v "$PWD/labs/php-upload-trace/conf/docker-php.conf:/etc/apache2/conf-enabled/docker-php.conf:ro" \
  -v "$PWD/labs/php-upload-trace/public:/var/www/html:ro" \
  --tmpfs /var/lab-uploads:rw,mode=1777 \
  php:8.3-apache
```

## Carga inocua

La petición siguiente envía un archivo de texto y permite observar la traza devuelta por PHP:

```bash
curl -i \
  -F 'document=@labs/php-upload-trace/fixtures/carga-inocua.txt;type=text/plain' \
  http://127.0.0.1:8002/upload.php
```

La respuesta indica el nombre recibido, el nombre base, la extensión derivada, el archivo temporal
de PHP, la decisión de la validación y el nombre aleatorio asignado por el servidor. El archivo se
guarda temporalmente en `/var/lab-uploads`, no bajo `/var/www/html`.

El contenedor se detiene con `Ctrl+C`. El archivo temporal se descarta al terminar la práctica.
