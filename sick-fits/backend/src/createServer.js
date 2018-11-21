const { GraphQLServer } = require('graphql-yoga');

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');

const db = require('./db');

// Create the graphql yoga server
function createServer() {
  return new GraphQLServer({
    // load in schema and match up everything in schema with resolvers
    typeDefs: 'src/schema.graphql',
    resolvers: {
      Mutation,
      Query,
    },
    // Needed this to get rid of some weird errors
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    // expose database to every single request (for auth)
    context: (req) => ({ ...req, db }),
  });
}

module.exports = createServer;
