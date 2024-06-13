# Express Feedback API MicroService

# Setup

## Setup Env variables

```
NODE_ENV=development
PORT=7000
CLIENT_ID=109269xxxxxxxxxxxxxxxxx.apps.googleusercontent.com <google oauth Client id>
CLIENT_SCERET=GOCxxx-xxxxxxx-xxxxxxxxxxxxx <google oauth client sceret>
FRILL_TOKEN=217557ca-xxxxx-xxxx-xxxxx-xxxxxxxx <frill api token>
DB=mongodb+srv://<username>:<password>@cluster0.0x2vsqy.mongodb.net/feedbacks <mongodb-connection-string/collectionName>
WORKER_COUNT=2 <number of workes >
```

## install pakages

```
npm install
```

## Lint

```
npm run lint
```

## Test

```
npm test
```

## Development

```
npm run dev
```

Development utilities:

- [nodemon](https://www.npmjs.com/package/nodemon)
  - nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.
- [eslint](https://www.npmjs.com/package/eslint)
  - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
- [jest](https://www.npmjs.com/package/jest)
  - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
- [supertest](https://www.npmjs.com/package/supertest)
  - HTTP assertions made easy via superagent.

