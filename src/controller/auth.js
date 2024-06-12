const ClientId = process.env.CLIENT_ID;
const ClientSceret = process.env.CLIENT_SCERET;
const redirectUrl = "http://127.0.0.1:7000/api/v1/oauth/redirect";
const { OAuth2Client } = require("google-auth-library");

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token${access_token}`
  );
  const data = await response.json();
  console.log("fetched processed accessToken", data);
}

const authRedirect = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    res.statusCode = 404;
    const codeError = new Error("This route is not for public use");
    throw codeError;
  }
  console.log("google code", code);
  try {
    const oAuth2Client = new OAuth2Client(ClientId, ClientSceret, redirectUrl);
    const res = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(res.tokens);
    console.log("tokens aquired");
    const user = oAuth2Client.credentials;
    await getUserData(user.access_token);
  } catch (e) {
    next(e);
  }
  res.json({
    message: "Token generated",
  });
};

const authRequest = async (req, res) => {
  res.header("Access-Controll-Allow-Origin", "http://localhost:5173");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const oAuth2Client = new OAuth2Client(ClientId, ClientSceret, redirectUrl);
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.email profile openid",
    prompt: "consent",
  });
  res.json({
    URL: authorizeUrl,
    message: "Generated an auth url",
  });
};

module.exports = { authRedirect, authRequest };
