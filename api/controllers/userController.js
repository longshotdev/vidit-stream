const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // important
const User = require("../models/User");
const apiRes = require("../helpers/apiResponses");
const isUserExist = require("../helpers/isUserExist");
const testURL = require("../../lib/testURL");
exports.signup = (req, res) => {
  const { username, password } = req.body;
  password.toString();
  User.find({ username: username })
    .exec()
    .then(user => {
      if (!user) {
        apiRes.error(res, "User Already Exists.");
      } else {
        // Suceeded
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            apiRes.error(res, "Error in Hashing");
          }

          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username: username,
            password: hash // fuck fuck i put the non hashed password and almost pushed it
          });
          user
            .save()
            .then(result => {
              const token = jwt.sign(
                {
                  username: result.username,
                  userID: result._id
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "1h"
                }
              );
              apiRes.successWithData(res, "User Created.", {
                token: token,
                validFor: "1hr",
                userData: {
                  type: result.type,
                  avatar: result.avatar,
                  id: result._id,
                  username: result.username,
                  version: result._v
                }
              });
            })
            .catch(err => apiRes.error(res, "Error: Couldnt make user"));
        });
      }
    });
};

exports.login = (req, res) => {
  console.log(req.body);
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return apiRes.validationError(res, "Incorrect Username");
      }
      console.log(user);
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          apiRes.validationError(res, "Incorrect Password");
        }
        if (result) {
          const token = jwt.sign(
            {
              username: user[0].username,
              userID: user[0]._id
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "1h"
            }
          );
          return apiRes.successWithData(res, "Successful Authorization", {
            token: token,
            validFor: "1hr",
            userData: {
              type: user[0].type,
              avatar: user[0].avatar,
              id: user[0]._id,
              username: user[0].username,
              version: user[0]._v
            }
          });
        }
        apiRes.validationError(res, "Incorrect Password");
      });
    })
    .catch(err => {
      console.log(err);
      apiRes.error(res, "An error occured.");
    });
};
exports.getUser = (req, res) => {
  User.find({ username: req.params.username })
    .exec()
    .then(user => {
      return apiRes.successWithData(res, "User found", {
        type: user[0].type,
        avatar: user[0].avatar,
        id: user[0]._id,
        username: user[0].username,
        version: user[0]._v
      });
    })
    .catch(err => apiRes.error(res, err));
};

exports.deleteUser = (req, res, next) => {
  User.remove({ _id: req.params.userID })
    .exec()
    .then(result => {
      apiRes.success(res, "User deleted succesfully");
    })
    .catch(err => {
      console.log(err);
      apiRes.error(res, err);
    });
};
exports.changeAvatar = (req, res, next) => {
  if (testURL(req.body.url)) {
    User.updateOne({ _id: req.body.id }, { avatar: req.body.url })
      .then(bruh => {
        User.find({ _id: req.body.id }).then(user => {
          console.log("NIGGEEEEEE");
          console.log(user);
          apiRes.successNoAuth(res, "Updated Avatar.", {
            type: user[0].type,
            avatar: user[0].avatar,
            id: user[0]._id,
            username: user[0].username,
            version: user[0]._v
          });
        });
      })
      .catch(err => apiRes.error(res, "error:" + err));
  }
};
