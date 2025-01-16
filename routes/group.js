const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить все группы (доступно всем)
router.get('/', async (req, res) => {
    try {
        const groups = await db.Group.findAll();
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создать группу (только админ)
router.post('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { name } = req.body;
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
        await group.destroy();
        res.json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;