const express = require("express");
const router = express.Router();

const { processFeedback, getFeedback } = require("../controller/feedback");

router.route("/submitFeedback").post(processFeedback);
router.route("/getFeedback").get(getFeedback);

module.exports = router;
