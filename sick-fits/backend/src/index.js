// This is an express server :D
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// User express middleware to handle cookies (JWT)
// middleware - func that runs between req and res
// will allow access to all cookies in a formatted object
server.express.use(cookieParser()); // allows you to use express middleware

// decode the JWT so we can get the user ID on each request
// this is a custom piece of middleware
server.express.use((req, res, next) => {
  // check dev tools application tab for cookies list
  // cookies are good because they can be sent automatically with each req, no need to manually check for them. Will automatically log in user on first page visit
  const { token } = req.cookies;
  if (token) {
    // APP_SECRET adds application specific encryption
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  next(); // signal to continue on
});

// Start it up!
// Hot Tip! Run yarn dev to throw --inspect flag on startup process, which dumps logs into chrome dev tools, not just terminal
// Hot Tip 2! yarn dev will restart when changes are made to js or graphql, needs to be specifically stated in command.
server.start(
  {
    // Only specified URL can connect
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
