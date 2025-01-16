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

// Создать преподавателя (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, userId } = req.body;
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
        await teacher.destroy();
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;