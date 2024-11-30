# Echo - Chat translation bot

Echo is a WhatsApp bot created with javascript that translates group messages between Turkish and English to improve communication between the Turkish and non-Turkish communities at Eastern Mediterranean University

## How to run locally

### Prerequisites

- You should have docker installed and running on your machine _(optional)_
- You should have NodeJS version 20 or higher and npm
- Google Cloud project with Translation API enabled
  - Create a GCP project
  - Enable Translation API
  - Create a service account and service account key with permissions to access Translation API
  - Download the service account key and save it inside the project directory as `service-account-key.json`

### Note:

You can still run the bot without google project and the bot will reply to messages but the messages will not be translated

### Setup

Clone git repository

```bash
git clone git@github.com:michealnaita/echo.git
```

Install dependencies

```bash
cd echo
npm install
```

**Environment Variables (with docker)**

Create a file named `.env` inside project directory and put your environment variables

```text
NODE_ENV=development
PHONE_NUMBER=<phonenumber eg. 90541234567>
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GCP_PROJECT_ID=<gcp project id>
```

**Environment Variables (without docker)**
Export env variables in terminal

```bash
export NODE_ENV=development
export PHONE_NUMBER=<phonenumber eg. 90541234567>
export GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
export GCP_PROJECT_ID=<gcp project id>
export PORT=<port number>
```

### Translation API

If you choose to use your own translation API, edit the `src/translations.ts` file and use your API of choice.

### Running Bot

With docker

```bash
bash dev
```

Without Docker

```
npm run dev
```

### Connecting Whatsapp

A QR code will be printed in the terminal. scan the QR code to link your WhatsApp account to the echo bot.

### Http server

By default the http server runs on port `80` but you can set port, `export PORT=3000` or `bash dev 3000`

This bot has an http server with the following endpoints

- To check bot status `/__/pingAgent`
- To start bot process `/__/startAgent`
- To end bot process `/__/killAgent`
-

### Technologies

- Javascript (Typescript)
- WhiskeySockets Baileys - https://github.com/WhiskeySockets/Baileys
