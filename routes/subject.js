const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все предметы с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
    try {
        const { name, teacherId, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const where = {};
        const order = [];
        const offset = (page - 1) * limit;

        if (name) where.name = { [db.Sequelize.Op.like]: `%${name}%` };
        if (teacherId) where.teacherId = teacherId;

        if (sortBy === 'name') order.push(['name', sortOrder || 'ASC']);
        if (sortBy === 'createdAt') order.push(['createdAt', sortOrder || 'DESC']);

        const subjects = await db.Subject.findAll({
            where,
            order,
            limit: parseInt(limit),
            offset: offset,
            include: [db.Teacher],
        });

        const totalSubjects = await db.Subject.count({ where });
        res.json({
            subjects,
            totalPages: Math.ceil(totalSubjects / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить список оценок по предмету
router.get('/:id/grades', async (req, res) => {
    try {
        const subject = await db.Subject.findByPk(req.params.id, {
            include: [db.Grade],
        });

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.json(subject.Grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать предмет (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name, teacherId } = req.body;

        // Валидация имени предмета
        if (!name || name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: 'Subject name must be between 2 and 100 characters' });
        }

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

        // Валидация имени предмета
        if (!name || name.length < 2 || name.length > 100) {
            return res.status(400).json({ message: 'Subject name must be between 2 and 100 characters' });
        }

        // Логируем изменение
        console.log(`Subject ${subject.id} changed from ${subject.name} to ${name}`);

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

        // Логируем удаление
        console.log(`Subject ${subject.id} deleted`);

        await subject.destroy();
        res.json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Привязать преподавателя к предмету (только админ)
router.post('/:subjectId/assign-teacher', authMiddleware('admin'), async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { teacherId } = req.body;

        // Проверяем, существует ли предмет
        const subject = await db.Subject.findByPk(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Проверяем, существует ли преподаватель
        const teacher = await db.Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Привязываем преподавателя к предмету
        subject.teacherId = teacherId;
        await subject.save();

        res.status(200).json({ message: 'Teacher assigned to subject', subject });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Отвязать преподавателя от предмета (только админ)
router.delete('/:subjectId/unassign-teacher', authMiddleware('admin'), async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Проверяем, существует ли предмет
        const subject = await db.Subject.findByPk(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Отвязываем преподавателя от предмета
        subject.teacherId = null;
        await subject.save();

        res.status(200).json({ message: 'Teacher unassigned from subject', subject });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;