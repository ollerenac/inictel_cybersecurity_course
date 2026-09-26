# Apache + PHP local: laboratorio 1

Este laboratorio compara un recurso estático con una respuesta generada por PHP. Se publica
solo en `http://127.0.0.1:8001` y no incluye carga de archivos ni acceso al CTF.

## Estructura

```text
conf/php.load          carga el módulo que incorpora PHP a Apache
conf/docker-php.conf   asigna los archivos .php al manejador de PHP
public/                DocumentRoot con los recursos del laboratorio
```

Los dos archivos de `conf/` corresponden a los fragmentos relevantes de la imagen
`php:8.3-apache`. Se montan desde el repositorio para que la configuración que explica el
laboratorio pueda inspeccionarse directamente.

## Arranque

Desde la raíz del repositorio, el laboratorio se inicia con:

```bash
docker run --rm --name apache-php-intro -p 127.0.0.1:8001:80 \
  -v "$PWD/labs/apache-php/conf/php.load:/etc/apache2/mods-enabled/php.load:ro" \
  -v "$PWD/labs/apache-php/conf/docker-php.conf:/etc/apache2/conf-enabled/docker-php.conf:ro" \
  -v "$PWD/labs/apache-php/public:/var/www/html:ro" \
  php:8.3-apache
```

- `php.load` hace que Apache cargue el módulo de PHP.
- `docker-php.conf` contiene `FilesMatch` y `SetHandler`, que asignan los archivos `.php` al
  manejador cargado.
- Todos los montajes son de solo lectura: PHP puede leer los archivos del laboratorio, pero no
  modificarlos.

## Comparación

Desde otra terminal, se pueden ejecutar estas dos peticiones:

```bash
curl -i http://127.0.0.1:8001/estatico.html
curl -i http://127.0.0.1:8001/respuesta.php
```

`estatico.html` se entrega sin ejecutarse. En cambio, `respuesta.php` genera el encabezado
`X-Lab-Renderer: php` y construye el HTML con datos de la petición que Apache puso a disposición
de PHP.

Se detiene el laboratorio con `Ctrl+C`. El contenedor se elimina automáticamente y los archivos
del repositorio no cambian.
