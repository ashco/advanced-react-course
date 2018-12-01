// User
// user = {
//   name: 'Ash',
//   permissions: ['ADMIN', 'ITEMUPDATE']
// }

// Check if they have any of these:
// permissionsNeeded = ['PERMISSIONUPDATE', 'ADMIN']

function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  }
}

exports.hasPermission = hasPermission;
