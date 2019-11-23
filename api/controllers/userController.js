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
            .then(result => apiRes.success(res, "User Created. Sign In."))
            .catch(err => apiRes.error(res, "Error: Couldnt make user"));
        });
      }
    });
};

exports.login = (req, res) => {
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        apiRes.validationError(res, "Incorrect Username");
      }
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
          return apiRes.successWithData(res, "Successful Authorization", token);
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
    User.updateOne({ username: req.params.username }, { avatar: req.body.url })
      .then(bruh => {
        apiRes.success(res, "Updated Avatar.");
      })
      .catch(err => apiRes.error(res, "error:" + err));
  }
};
