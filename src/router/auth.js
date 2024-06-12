const express = require("express");
const router = express.Router();

const { authRedirect, authRequest } = require("../controller/auth");

router.route("/redirect").get(authRedirect);
router.route("/request").post(authRequest);

module.exports = router;
