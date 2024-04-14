const express = require('express');

const router = express.Router();
const categoriesController = require('../controllers/CategoriesController');

router.get('/:id', categoriesController.getList);
router.get('/:id/page/:page', categoriesController.getListAtPage);

module.exports = router;