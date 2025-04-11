const express = require('express');
const bodyParser = require('body-parser');
const parkingRoutes = require('./routes/parkingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./utils/auth');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middleware для логирования
app.use(morgan('dev'));

// Middleware для парсинга тела запроса
app.use(bodyParser.json());

// Middleware для обработки CORS
app.use(cors());

// Маршруты для парковочных мест
app.use('/api/parking', verifyToken, parkingRoutes);

// Маршруты для ИИ модели
app.use('/api/ai', aiRoutes);

// Маршруты для регистрации пользователей
app.use('/api/auth', authRoutes);

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
