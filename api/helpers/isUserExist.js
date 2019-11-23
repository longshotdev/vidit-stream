// This will return true or false
const User = require("../models/User");
module.exports = username => {
  const shitfuckfaggot = User.find({ username: username }).exec();
  return shitfuckfaggot.then(_user => {
    if (_user.length <= 0) return false;
    return {
      statusCode: true,
      data: bruhmoment
    };
  });
};
