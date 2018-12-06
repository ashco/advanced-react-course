const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

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
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // custom check if there is a current user ID
    // can access request and response from ctx
    if (!ctx.request.userId) {
      return null; // want this query to be able to return nothing
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info // this passes along specific stuff... not entirely sure
    );
  },

  async users(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in.');
    }
    // 2. Check if user has permissions to query all users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // 3. If they do, query all the users
    return ctx.db.query.users({}, info); // info includes graphql query that has the fields we are requesting (from front end).
  },

  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('You arent logged in!');
    }
    // 2. Query the current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info
    );
    // 3. Check if they have the permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error('You cant see this budddy');
    }
    // 4. Return the order
    return order;
  },
};

module.exports = Query;
