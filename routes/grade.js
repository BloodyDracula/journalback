const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все оценки (доступно всем)
router.get('/', async (req, res) => {
    try {
        const grades = await db.Grade.findAll({
            include: [db.Student, db.Subject],
        });
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать оценку (только преподаватель)
router.post('/', authMiddleware('teacher'), async (req, res) => {
    try {
        const { grade, studentId, subjectId } = req.body;
        const newGrade = await db.Grade.create({ grade, studentId, subjectId });
        res.status(201).json(newGrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить оценку (только преподаватель)
router.put('/:id', authMiddleware('teacher'), async (req, res) => {
    try {
        const { grade } = req.body;
        const existingGrade = await db.Grade.findByPk(req.params.id);
        if (!existingGrade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        existingGrade.grade = grade;
        await existingGrade.save();
        res.json(existingGrade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить оценку (только преподаватель)
router.delete('/:id', authMiddleware('teacher'), async (req, res) => {
    try {
        const grade = await db.Grade.findByPk(req.params.id);
        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        await grade.destroy();
        res.json({ message: 'Grade deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;