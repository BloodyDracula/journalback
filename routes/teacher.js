const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить всех преподавателей (доступно всем)
router.get('/', async (req, res) => {
    try {
        const teachers = await db.Teacher.findAll({
            include: [db.User],
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить преподавателя по ID (доступно всем)
router.get('/:id', async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id, {
            include: [db.User],
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить все предметы, которые ведёт преподаватель (доступно всем)
router.get('/:teacherId/subjects', async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Проверяем, существует ли преподаватель
        const teacher = await db.Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Получаем все предметы, которые ведёт преподаватель
        const subjects = await db.Subject.findAll({ where: { teacherId } });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать преподавателя (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, userId } = req.body;

        // Проверяем, существует ли пользователь
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Создаём преподавателя
        const teacher = await db.Teacher.create({ name, userId });
        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить преподавателя (только админ)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, userId } = req.body;
        const teacher = await db.Teacher.findByPk(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Проверяем, существует ли пользователь
        if (userId) {
            const user = await db.User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        // Обновляем данные преподавателя
        teacher.name = name;
        teacher.userId = userId;
        await teacher.save();

        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить преподавателя (только админ)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Удаляем преподавателя
        await teacher.destroy();
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;