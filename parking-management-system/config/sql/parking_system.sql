-- Создание таблицы users (пользователи)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL COMMENT 'Имя пользователя',
    email VARCHAR(255) NOT NULL COMMENT 'Электронная почта',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
    UNIQUE (email)
);

-- Создание таблицы parking_spaces (парковочные места)
CREATE TABLE IF NOT EXISTS parking_spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Название парковочного места',
    location VARCHAR(255) NOT NULL COMMENT 'Местоположение',
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available' COMMENT 'Статус: доступно, занято, зарезервировано',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления'
);

-- Создание таблицы reservations (бронирования)
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'ID пользователя',
    parking_space_id INT NOT NULL COMMENT 'ID парковочного места',
    start_time DATETIME NOT NULL COMMENT 'Время начала бронирования',
    end_time DATETIME NOT NULL COMMENT 'Время окончания бронирования',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parking_space_id) REFERENCES parking_spaces(id) ON DELETE CASCADE,
    CHECK (end_time > start_time)
);

-- Запрос: Получить все парковочные места с текущим статусом бронирования
SELECT 
    ps.id,
    ps.name AS название,
    ps.location AS местоположение,
    ps.status AS статус,
    r.id AS id_бронирования,
    r.start_time AS время_начала,
    r.end_time AS время_окончания,
    u.username AS забронировал
FROM parking_spaces ps
LEFT JOIN reservations r ON ps.id = r.parking_space_id
    AND r.start_time <= NOW()
    AND r.end_time >= NOW()
LEFT JOIN users u ON r.user_id = u.id;

-- Запрос: Получить все парковочные места
SELECT * FROM parking_spaces;

-- Запрос: Создать новое парковочное место
INSERT INTO parking_spaces (name, location, status)
VALUES (?, ?, ?);

-- Запрос: Обновить парковочное место
UPDATE parking_spaces 
SET name = ?, location = ?, status = ? 
WHERE id = ?;

-- Запрос: Удалить парковочное место
DELETE FROM parking_spaces WHERE id = ?;

-- Запрос: Создать новое бронирование
INSERT INTO reservations (user_id, parking_space_id, start_time, end_time)
VALUES (?, ?, ?, ?);

-- Запрос: Получить все бронирования для конкретного пользователя
SELECT 
    r.id,
    r.start_time AS время_начала,
    r.end_time AS время_окончания,
    ps.name AS название_парковки,
    ps.location AS местоположение
FROM reservations r
JOIN parking_spaces ps ON r.parking_space_id = ps.id
WHERE r.user_id = ?;

-- Запрос: Получить доступные парковочные места на заданный временной диапазон
SELECT 
    ps.id,
    ps.name AS название,
    ps.location AS местоположение,
    ps.status AS статус
FROM parking_spaces ps
WHERE ps.status = 'available'
AND NOT EXISTS (
    SELECT 1 
    FROM reservations r 
    WHERE r.parking_space_id = ps.id
    AND (
        (r.start_time <= ? AND r.end_time >= ?) -- Проверка пересечения
        OR (r.start_time >= ? AND r.start_time <= ?) -- Начало в диапазоне
        OR (r.end_time >= ? AND r.end_time <= ?) -- Окончание в диапазоне
    )
);

-- Запрос: Обновить время бронирования
UPDATE reservations 
SET start_time = ?, end_time = ? 
WHERE id = ?;

-- Запрос: Отменить бронирование
DELETE FROM reservations WHERE id = ?;

-- Запрос: Получить всех пользователей
SELECT * FROM users;

-- Запрос: Создать нового пользователя
INSERT INTO users (username, email)
VALUES (?, ?);

-- Запрос: Обновить информацию о пользователе
UPDATE users 
SET username = ?, email = ? 
WHERE id = ?;

-- Запрос: Удалить пользователя
DELETE FROM users WHERE id = ?;
