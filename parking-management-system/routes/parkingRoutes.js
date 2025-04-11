const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// Получение всех парковочных мест
router.get('/', parkingController.getAllParkingSpaces);

// Создание нового парковочного места
router.post('/', parkingController.createParkingSpace);

// Обновление парковочного места
router.put('/:id', parkingController.updateParkingSpace);

// Удаление парковочного места
router.delete('/:id', parkingController.deleteParkingSpace);

module.exports = router;
