const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все группы с фильтрацией, сортировкой и пагинацией
router.get('/', async (req, res) => {
    try {
        const { name, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const where = {};
        const order = [];
        const offset = (page - 1) * limit;

        if (name) where.name = { [db.Sequelize.Op.like]: `%${name}%` };

        if (sortBy === 'name') order.push(['name', sortOrder || 'ASC']);
        if (sortBy === 'createdAt') order.push(['createdAt', sortOrder || 'DESC']);

        const groups = await db.Group.findAll({
            where,
            order,
            limit: parseInt(limit),
            offset: offset,
        });

        const totalGroups = await db.Group.count({ where });
        res.json({
            groups,
            totalPages: Math.ceil(totalGroups / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить список студентов группы
router.get('/:id/students', async (req, res) => {
    try {
        const group = await db.Group.findByPk(req.params.id, {
            include: [db.Student],
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group.Students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать группу (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name } = req.body;

        // Валидация имени группы
        if (!name || name.length < 2 || name.length > 50) {
            return res.status(400).json({ message: 'Group name must be between 2 and 50 characters' });
        }

        const group = await db.Group.create({ name });
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить группу (только админ)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const { name } = req.body;
        const group = await db.Group.findByPk(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Валидация имени группы
        if (!name || name.length < 2 || name.length > 50) {
            return res.status(400).json({ message: 'Group name must be between 2 and 50 characters' });
        }

        // Логируем изменение
        console.log(`Group ${group.id} changed from ${group.name} to ${name}`);

        group.name = name;
        await group.save();
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить группу (только админ)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const group = await db.Group.findByPk(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Логируем удаление
        console.log(`Group ${group.id} deleted`);

        await group.destroy();
        res.json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Добавить студента в группу (только админ)
router.post('/:groupId/students', authMiddleware('admin'), async (req, res) => {
    try {
        const { studentId } = req.body;
        const groupId = req.params.groupId;

        // Проверяем, существует ли группа
        const group = await db.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Проверяем, существует ли студент
        const student = await db.Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Проверяем, не состоит ли студент уже в другой группе
        if (student.groupId) {
            return res.status(400).json({ message: 'Student is already in a group' });
        }

        // Добавляем студента в группу
        student.groupId = groupId;
        await student.save();

        res.status(201).json({ message: 'Student added to group', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить студента из группы (только админ)
router.delete('/:groupId/students/:studentId', authMiddleware('admin'), async (req, res) => {
    try {
        const { groupId, studentId } = req.params;

        // Проверяем, существует ли группа
        const group = await db.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Проверяем, существует ли студент
        const student = await db.Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Проверяем, что студент состоит в этой группе
        if (student.groupId !== parseInt(groupId)) {
            return res.status(400).json({ message: 'Student is not in this group' });
        }

        // Удаляем студента из группы
        student.groupId = null;
        await student.save();

        res.json({ message: 'Student removed from group', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;