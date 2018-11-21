require('dotenv').config({ path: 'variables.env' });

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO User express middleware to handle cookies (JWT)
// TODO User express middleware to populate current user

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
  (deets) => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
