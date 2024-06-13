const app = require("./app");
const port = process.env.PORT || 5000;
const DBUIR = process.env.DB;
const connetDB = require("./DB/connect");

const startServer = async () => {
  try {
    await connetDB(DBUIR);
    app.listen(port, () => {
      /* eslint-disable no-console */
      console.clear();
      console.log("Starting App");
      console.log(`Listening: http://localhost:${port}`);
      /* eslint-enable no-console */
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

