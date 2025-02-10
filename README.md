# Base setup for NestJs

This is a base project for nodejs it includes following features

## Features

- Authentication with JWT
- Authorization
- Rate limiter
- User / Role / Permission
- Custom logger
- Docker file

## Run Locally

Clone the project

```bash
  git clone https://github.com/habibqureshi/nodejs-base-setup.git
```

Go to the project directory

```bash
  cd nodejs-base-setup
```

Node Version : `v23.5.0`

Install dependencies

```bash
  npm i
```

Start the server

```bash
  npm run dev
```

SQL schema

```bash
 use base-setup.sql file
```

## Running on Docker

Build image

```bash
   docker build -t nodejsbase .
```

Run container

```bash
  docker run -p 3000:3000 nodejsbase
```

Run container in background

```bash
  docker run -d -p 3000:3000 nodejsbase
```

Run container in background with env

```bash
  docker run -e VARIABLE=VALUE -d -p 3000:3000 nodejsbase
```

## Custom logger output

<img width="1281" alt="image" src="https://github.com/user-attachments/assets/ac098d60-93f7-4e49-9a5b-cc5443f3df2f" />

## Folder structure

<img width="255" alt="image" src="https://github.com/user-attachments/assets/737ac482-39e3-4bc0-81e3-f8e5bffb3f21" />

## Authors

- [@habibqureshi](https://github.com/habibqureshi)
