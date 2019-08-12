const express = require('express');
const debug = require('debug')('app:friendRoutes');
const { ifSignIn } = require('../controllers/helpers/restrictions')();
const { findUserByEmail, addFriend } = require('../controllers/helpers/mongo')();

const friendRouter = express.Router();

const router = () => {
  friendRouter
    .route('/')
    .all(ifSignIn)
    .get((req, res) => {
      const { friends } = req.user;
      res.render('friends', { friends });
    })
    .post((req, res) => {
      const { friendsEmail } = req.body;
      if (friendsEmail !== req.user.email) {
        (async function friends() {
          let result;
          if (req.user.friends.length) {
            result = req.user.friends.find(ele => ele.email === friendsEmail);
          }
          if (!result) {
            result = await findUserByEmail(friendsEmail);
            if (result) {
              const friend = { name: result.name, email: result.email, college: result.college };
              result = await addFriend(req.user.email, friend);
              req.user.friends.push(friend);
              req.session.save();
            }
          }
          res.redirect('/friends');
        }());
      } else {
        res.redirect('/friends');
      }
    });

  return friendRouter;
};

module.exports = router;