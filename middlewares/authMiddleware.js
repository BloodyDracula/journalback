const jwt = require('jsonwebtoken');

function authMiddleware(role) {
    return (req, res, next) => {
        // Получаем токен из заголовка Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        // Если токен отсутствует, возвращаем ошибку
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        try {
            // Проверяем токен и декодируем его
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Если указана роль, проверяем, соответствует ли она роли пользователя
            if (role && decoded.role !== role) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            // Добавляем декодированные данные пользователя в объект запроса
            req.user = decoded;

            // Передаем управление следующему middleware или обработчику маршрута
            next();
        } catch (error) {
            // Если токен невалиден, возвращаем ошибку
            res.status(400).json({ message: 'Invalid token.' });
        }
    };
}

module.exports = authMiddleware;