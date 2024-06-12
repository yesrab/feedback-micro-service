const express = require("express");
const router = express.Router();

const { processFeedback } = require("../controller/feedback");

router.route("/submitFeedback").post(processFeedback);

module.exports = router;
