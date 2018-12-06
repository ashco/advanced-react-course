const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// built in node modules
const { randomBytes } = require('crypto');
const { promisify } = require('util'); // turns callback functions into promise based functions

const { hasPermission } = require('../utils');
const { transport, makeANiceEmail } = require('../mail');

const stripe = require('../stripe');

const Mutations = {
  // // Must mirror what's in schema
  // createDog(parent, args, ctx, info) {
  //   global.dogs = global.dogs || [];
  //   // create a dog!
  //   const newDog = { name: args.name };
  //   global.dogs.push(newDog);
  //   return newDog;
  //   // console.log(args);
  // },

  //* function names have to match what is in schema

  async createItem(parent, args, ctx, info) {
    // check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.');
    }

    // This is a Promise
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how we create a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );

    // Return the promise
    return item;
  },

  updateItem(parent, args, ctx, info) {
    // first take copy of updates
    const updates = { ...args };
    // remove the ID from the updates
    // The JavaScript delete operator removes a property from an object
    delete updates.id;
    // run the updates method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);
    // 2. check if they own item or have permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );
    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to do that!");
    }

    // 3. Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // lowercase email for sanity
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    // createUser method located in ../generated/prisma.graphql file
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          // same as...
          // name: args.name,
          // email: args.email,
          // password: args.password,
          password,
          permissions: { set: ['USER'] }, // have to set because permission is an enum
        },
      },
      info // pass info as second arg so it knows what to return to client
    );
    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // we set the JWT as a cookie on the response - use cookie so user can log in and it will be checked before page load
    ctx.response.cookie('token', token, {
      httpOnly: true, // only http can access cookie, not javascript - helps protect against hacking
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // Finally return user to browser
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      // error will be returned with query, error will be handled on frontend
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    // first password arg is hashed, compared with user.password which is already hashed
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 5. return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token'); // provided by cookieparser
    return { message: 'Goodbye!' };
  },

  async requestReset(parent, args, ctx, info) {
    // 1. Check if real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    console.log(res);
    // 3. email them a reset token
    const mailRes = await transport.sendMail({
      from: 'ash@ashco.io',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is Here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });

    // 4. Return the message
    return { message: 'thanks' };
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Your passwords don't match!");
    }
    // 2. Check if it's a legit reset token
    // 3. Check if it's expired
    const [user] = await ctx.db.query.users({
      // return first response from USERS query (not user), allows for wider available filter options
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000, // checks if greater than
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }
    // 4. Hash their new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      // Data you want to update
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 8. return new user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    // 2. Query the current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    // 3. Check if they have the permission to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    );
  },

  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in!');
    }
    // 2. Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      // more flexible queries from cartItems, not cartItem
      where: {
        user: { id: userId }, // has THIS user
        item: { id: args.id }, // put THIS item into their cart before?
      },
    });
    // 3. Check if the item is in the cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('This item is alread in their cart');
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }
    // 4. if not, create a fresh cart item for that user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    );
  },

  async removeFromCart(parent, args, ctx, info) {
    // 1. Find cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{id, user { id }}`
    );
    // 1.5 Make sure we found an item
    if (!cartItem) throw new Error('No CartItem Found');
    // 2. Make sure they own the cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error(`This ain't yo cart!`);
    }
    // 3. Delete cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    );
  },

  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user , make sure they are signed in
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to complete this order.');
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item { title price id description image largeImage }
        }
      }`
    );
    // 2. recalculate the total for the price - make sure noone is sending over 1cent  price by manipulative JS.
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    console.log(`Going to charge for a total of ${amount}`);
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    // 4. convert the cartitems to orderitems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });
    // 7. return the Order to the client
    return order;
  },
};

module.exports = Mutations;
