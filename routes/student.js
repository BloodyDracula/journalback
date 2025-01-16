const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить всех студентов (доступно всем)
router.get('/', async (req, res) => {
    try {
        const students = await db.Student.findAll({
            include: [db.User, db.Group],
        });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать студента (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, groupId, userId } = req.body;
        const student = await db.Student.create({ name, groupId, userId });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить студента (только админ)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, groupId, userId } = req.body;
        const student = await db.Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        student.name = name;
        student.groupId = groupId;
        student.userId = userId;
        await student.save();
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить студента (только админ)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        await student.destroy();
        res.json({ message: 'Student deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;