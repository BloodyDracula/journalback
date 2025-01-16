const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все предметы (доступно всем)
router.get('/', async (req, res) => {
    try {
        const subjects = await db.Subject.findAll({
            include: [db.Teacher],
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать предмет (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, teacherId } = req.body;
        const subject = await db.Subject.create({ name, teacherId });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить предмет (только админ)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, teacherId } = req.body;
        const subject = await db.Subject.findByPk(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        subject.name = name;
        subject.teacherId = teacherId;
        await subject.save();
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить предмет (только админ)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const subject = await db.Subject.findByPk(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        await subject.destroy();
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;