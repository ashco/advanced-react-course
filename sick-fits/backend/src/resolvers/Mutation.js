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
  async createItem(parent, args, ctx, info) {
    // TODO: check if logged in

    // This is a Promise
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );

    // Return the promise
    return item;
  },
};

module.exports = Mutations;
