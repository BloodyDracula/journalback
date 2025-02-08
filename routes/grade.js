const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все оценки с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
    try {
        const { studentId, subjectId, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const where = {};
        const order = [];
        const offset = (page - 1) * limit;

        if (studentId) where.studentId = studentId;
        if (subjectId) where.subjectId = subjectId;

        if (sortBy === 'grade') order.push(['grade', sortOrder || 'ASC']);
        if (sortBy === 'createdAt') order.push(['createdAt', sortOrder || 'DESC']);

        const grades = await db.Grade.findAll({
            where,
            order,
            limit: parseInt(limit),
            offset: offset,
            include: [db.Student, db.Subject],
        });

        const totalGrades = await db.Grade.count({ where });
        res.json({
            grades,
            totalPages: Math.ceil(totalGrades / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить средний балл по ученику или предмету
router.get('/average', async (req, res) => {
    try {
        const { studentId, subjectId } = req.query;
        const where = {};

        if (studentId) where.studentId = studentId;
        if (subjectId) where.subjectId = subjectId;

        const result = await db.Grade.findOne({
            where,
            attributes: [
                [db.sequelize.fn('AVG', db.sequelize.col('grade')), 'averageGrade'],
            ],
        });

        res.json({ averageGrade: result.dataValues.averageGrade || 0 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать оценку (только преподаватель)
router.post('/', authMiddleware('teacher'), async (req, res) => {
    try {
        const { grade, studentId, subjectId } = req.body;

        // Валидация оценки
        if (grade < 1 || grade > 5) {
            return res.status(400).json({ message: 'Grade must be between 1 and 5' });
        }

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
        const existingGrade = await db.Grade.findByPk(req.params.id, {
            include: [db.Subject],
        });

        if (!existingGrade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Проверка прав доступа
        if (existingGrade.Subject.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'You are not allowed to update this grade' });
        }

        // Валидация оценки
        if (grade < 1 || grade > 5) {
            return res.status(400).json({ message: 'Grade must be between 1 and 5' });
        }

        // Логируем изменение
        console.log(`Grade ${existingGrade.id} changed from ${existingGrade.grade} to ${grade}`);

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
        const grade = await db.Grade.findByPk(req.params.id, {
            include: [db.Subject],
        });

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        // Проверка прав доступа
        if (grade.Subject.teacherId !== req.user.id) {
            return res.status(403).json({ message: 'You are not allowed to delete this grade' });
        }

        await grade.destroy();
        res.json({ message: 'Grade deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;