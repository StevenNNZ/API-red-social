# BACK Red Social

Prueba técnica para INLAZE. Objetivo Desarrollar una aplicación de red social que permita a los usuarios registrarse, iniciar sesión, publicar mensajes, ver el muro, buscar mensajes, gestionar su perfil y realizar acciones adicionales.

## Comandos para levantar el proyecto de manera local

Levantar base de datos en mongodb
Copiar el archivo `.env.template` y reenombrarlo a `.env`

1. Instalar las dependencias

```
npm install
```

2. Bajar la imagen de mongoDB requerida para el proyecto

```
docker pull mongo:5.0.16
```

3. Levantar la base de datos con docker

```
docker compose  up -d
```

4. Levantar el proyecto en desarrollo

```
npm run dev
```
