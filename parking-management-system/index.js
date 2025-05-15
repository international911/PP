const express = require('express');
const bodyParser = require('body-parser');
const parkingRoutes = require('./routes/parkingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./utils/auth');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./config/db'); // Подключение к базе данных

const app = express();

// Middleware для логирования
app.use(morgan('dev'));

// Middleware для парсинга тела запроса
app.use(bodyParser.json());

// Middleware для обработки CORS
app.use(cors());

// Функция для выполнения SQL-скрипта
const initializeDatabase = async () => {
  try {
    const sqlFilePath = path.join(__dirname, 'config', 'sql', 'parking_system.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Разделяем запросы, игнорируя параметризованные
    const queries = sqlScript
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && 
              !q.includes('?') && 
              (q.startsWith('CREATE TABLE') || q.startsWith('INSERT INTO') || q.startsWith('UPDATE') || q.startsWith('DELETE')));

    for (const query of queries) {
      await db.query(query);
    }
    
    console.log('База данных успешно инициализирована с помощью parking_system.sql');
  } catch (err) {
    console.error('Ошибка при инициализации базы данных:', err.message);
    process.exit(1);
  }
};

// Инициализация базы данных перед запуском сервера
initializeDatabase().then(() => {
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
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});