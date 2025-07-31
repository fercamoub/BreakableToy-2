# Breakable Toy II

Welcome to **Breakable Toy II**
This project provides a full stack web application that consumes Spotify web API, it uses OAuth2.0 Authentication and storages the token in a H2 Database, it also uses React context after retrieving the token to access the API.

## Getting Started

### Prerequisites

- Java 22+
- Node.js 20+
- Docker(optional)

1. Clone the repository.
   ```
   git clone https://github.com/fercamoub/BreakableToy-2
   cd BtDemoRepo
   ```
2. Follow the setup instructions below.

#### using docker:

```
docker compose build
docker compose up
```

#### using Gradle and Node.js

```
cd bt-back
./gradlew bootRun
```

```
cd btfront
npm install
npm run dev
```

## Features

- OAuth2.0 Authentication
- Docker enviroment
- H2 Database

## Technologies

### Front end

- React, Material UI

### Back end

- Spring boot, Gradle(Groovy)
