const { forwardTo } = require('prisma-binding');

// Entries in here are called resolvers. Resolvers are how we declare how the server can interact with Prisma DB
const Query = {
  // below is shorthand for items: function (args) {}
  // async items(parent, args, ctx, info) {
  //   console.log('Getting Items!');
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
  // If query is exactly the same on Yoga as it is on Prisma, you can forward query...
  // sends query straight to Prisma server, note that it doesn't allow for auth and stuff
  items: forwardTo('db'),
};

module.exports = Query;
