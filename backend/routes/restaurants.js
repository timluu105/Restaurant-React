const express = require('express');
const restaurantCtrl = require('../controllers/restaurant');
const reviewCtrl = require('../controllers/review');
const ROLES = require('../constants');
const policies = require('../policies');

const router = express.Router();
router.use(policies.checkRoles([ROLES.ADMIN, ROLES.OWNER, ROLES.USER]));

router.route('/').get(restaurantCtrl.list).post(restaurantCtrl.create);

router
  .route('/:restaurantId')
  .get(restaurantCtrl.read)
  .put(restaurantCtrl.update)
  .delete(restaurantCtrl.remove);

router.route('/:restaurantId/report').get(restaurantCtrl.report);

router
  .route('/:restaurantId/reviews')
  .get(reviewCtrl.list)
  .post(reviewCtrl.create);

router
  .route('/:restaurantId/reviews/:reviewId')
  .get(reviewCtrl.read)
  .put(reviewCtrl.update)
  .delete(reviewCtrl.remove);

router.param('restaurantId', restaurantCtrl.getRestaurantByID);
router.param('reviewId', reviewCtrl.getReviewByID);
module.exports = router;
