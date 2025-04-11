const db = require('../config/db');

// Получение всех парковочных мест
exports.getAllParkingSpaces = (callback) => {
  const sql = 'SELECT * FROM parking_spaces';
  db.query(sql, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

// Создание нового парковочного места
exports.createParkingSpace = (parkingSpace, callback) => {
  const { name, location, status } = parkingSpace;
  const sql = 'INSERT INTO parking_spaces (name, location, status) VALUES (?, ?, ?)';
  db.query(sql, [name, location, status], (err, result) => {
    if (err) return callback(err, null);
    callback(null, { id: result.insertId, ...parkingSpace });
  });
};

// Обновление парковочного места
exports.updateParkingSpace = (id, parkingSpace, callback) => {
  const { name, location, status } = parkingSpace;
  const sql = 'UPDATE parking_spaces SET name = ?, location = ?, status = ? WHERE id = ?';
  db.query(sql, [name, location, status, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, { id, name, location, status });
  });
};

// Удаление парковочного места
exports.deleteParkingSpace = (id, callback) => {
  const sql = 'DELETE FROM parking_spaces WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, { message: 'Parking space deleted' });
  });
};
