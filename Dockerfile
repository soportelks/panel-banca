
###########################
# Etapa 1: Construir la aplicación de Ionic
#FROM node:18 as build

# Establecer el directorio de trabajo dentro del contenedor
#WORKDIR /usr/src/app

# Copiar los archivos generados de Ionic al contenedor
#COPY www/ .

# Etapa 2: Configurar el servidor web Nginx
#FROM nginx:latest

# Copiar la configuración de Nginx
#COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos generados de Ionic al directorio de Nginx
#COPY --from=build /usr/src/app /usr/share/nginx/html

# base image
#FROM nginx:1.17.1-alpine
#COPY nginx.conf /etc/nginx/nginx.conf
#COPY www /usr/share/nginx/html

# Exponer el puerto 80 utilizado por Nginx
#EXPOSE 80

# Usar Nginx con Alpine para una imagen ligera
FROM nginx:1.17.1-alpine

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos generados de Ionic
COPY www /usr/share/nginx/html

# Copiar los certificados SSL al contenedor
COPY cert/scs1732055889166_lksbaas.com.mx_server.crt /etc/nginx/ssl/certificado.crt
COPY cert/scs1732055889166_lksbaas.com.mx_server.key /etc/nginx/ssl/clave.key

# Exponer los puertos HTTP (80) y HTTPS (443)
EXPOSE 80 443
