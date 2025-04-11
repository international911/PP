const parkingModel = require('../models/parking');

// Получение всех парковочных мест
exports.getAllParkingSpaces = (req, res) => {
  parkingModel.getAllParkingSpaces((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Создание нового парковочного места
exports.createParkingSpace = (req, res) => {
  const parkingSpace = req.body;
  parkingModel.createParkingSpace(parkingSpace, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Обновление парковочного места
exports.updateParkingSpace = (req, res) => {
  const { id } = req.params;
  const parkingSpace = req.body;
  parkingModel.updateParkingSpace(id, parkingSpace, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Удаление парковочного места
exports.deleteParkingSpace = (req, res) => {
  const { id } = req.params;
  parkingModel.deleteParkingSpace(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};
