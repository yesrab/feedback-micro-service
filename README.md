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

# API routes

/ => **GET** server Status

/api/v1/feedback/getfeedback => **GET** get the list of all submited feedbacks

/api/v1/feedback/submitFeedback => **POST** Post feedback object of type

```
{
    "name": "xxxxxxx" <name of the author>
    "email": "xxxx@xxxx.xx", <email id of the auhtor>
    "summary": "test feedback", <title of the Feedback>
    "idea": "final test of the service if the service is not working please wait 50s due to onRender spinning down free services when inactive", <Decreption of the feedback>
    "topic": "topic_63p08yev" <topic of the feedback>
}
```

**topics id**

```
  "topic_63p08yev" =>  "Product Usablity 💁‍♂️"
  "topic_1djxlq13" => "Product Features ⚙️"
  "topic_5d9ok81d" => "Product Pricing 💰"
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

