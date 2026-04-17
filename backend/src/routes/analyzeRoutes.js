const express = require('express');
const router = express.Router();
const { analyzeText, getHistory } = require('../controllers/analyzeController');

router.post('/', analyzeText);
router.get('/history', getHistory);

module.exports = router;
