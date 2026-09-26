# Apache local: laboratorio 0

Este laboratorio sirve contenido estático en `http://localhost:8080`. No incluye PHP,
formularios, archivos de carga ni configuración por directorio.

## Estructura

```text
conf/httpd.conf   configuración mínima de Apache
public/            DocumentRoot montado como contenido de solo lectura
logs/              access.log y error.log generados al arrancar
```

## Arranque

Desde la raíz del repositorio, ejecuta:

```bash
docker run --rm --name apache-intro -p 127.0.0.1:8080:8080 \
  -v "$PWD/labs/apache-intro/conf/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro" \
  -v "$PWD/labs/apache-intro/public:/usr/local/apache2/htdocs:ro" \
  -v "$PWD/labs/apache-intro/logs:/usr/local/apache2/logs" \
  httpd:2.4
```

Detén el laboratorio con `Ctrl+C`. El contenedor se elimina automáticamente; la configuración,
el contenido y los logs permanecen en esta carpeta.

## Comprobaciones

En otra terminal:

```bash
curl -i http://localhost:8080/
tail -n 1 labs/apache-intro/logs/access.log
```

## Configuración central frente a configuración distribuida

El archivo `conf/httpd.conf` representa la configuración central del administrador. Contiene
`AllowOverride None`, por lo que Apache ignora el archivo `public/.htaccess`.

1. Inicia el laboratorio con el comando de la sección anterior y visita `http://localhost:8080/`.
   La URL devuelve `index.html`.
2. Inspecciona la regla local:

   ```bash
   cat labs/apache-intro/public/.htaccess
   ```

   Aunque contiene `DirectoryIndex portada.html`, esa regla no tiene efecto mientras Apache use
   `AllowOverride None`.
3. Detén el contenedor con `Ctrl+C`. Compara ambos perfiles:

   ```bash
   diff -u labs/apache-intro/conf/httpd.conf \
     labs/apache-intro/conf/httpd-distributed.conf
   ```

   La única diferencia relevante permite la clase `Indexes` en la configuración por directorio.
4. Inicia Apache con el perfil distribuido:

   ```bash
   docker run --rm --name apache-intro -p 127.0.0.1:8080:8080 \
     -v "$PWD/labs/apache-intro/conf/httpd-distributed.conf:/usr/local/apache2/conf/httpd.conf:ro" \
     -v "$PWD/labs/apache-intro/public:/usr/local/apache2/htdocs:ro" \
     -v "$PWD/labs/apache-intro/logs:/usr/local/apache2/logs" \
     httpd:2.4
   ```

5. Desde otra terminal, ejecuta `curl -i http://localhost:8080/`. La misma URL ahora devuelve
   `portada.html`, porque Apache aplicó la regla local.
6. Detén el contenedor y vuelve a iniciarlo con `conf/httpd.conf` para restaurar el perfil seguro.

No se usa PHP en esta demostración. El cambio visible proviene únicamente de una regla de Apache
por directorio.
