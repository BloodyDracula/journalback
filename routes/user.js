const express = require('express');
const db = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Получить всех пользователей с фильтрацией, сортировкой и пагинацией (только админ)
router.get('/', authMiddleware('admin'), async (req, res) => {
    try {
        const { role, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
        const where = {};
        const order = [];
        const offset = (page - 1) * limit;

        if (role) where.role = role;

        if (sortBy === 'username') order.push(['username', sortOrder || 'ASC']);
        if (sortBy === 'createdAt') order.push(['createdAt', sortOrder || 'DESC']);

        const users = await db.User.findAll({
            where,
            order,
            limit: parseInt(limit),
            offset: offset,
        });

        const totalUsers = await db.User.count({ where });
        res.json({
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить пользователя по ID (только админ)
router.get('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получить связанные данные пользователя (студент или преподаватель) (только админ)
router.get('/:id/details', authMiddleware('admin'), async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id, {
            include: [db.Student, db.Teacher],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Обновить данные пользователя (только админ)
router.put('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const { username, password, firstName, lastName, middleName, role } = req.body;
        const user = await db.User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Логируем изменение
        console.log(`User ${user.id} updated:`, { username, role });

        if (username) user.username = username;
        if (password) user.password = password; // В реальном приложении хэшируйте пароль!
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (middleName) user.middleName = middleName;
        if (role) user.role = role;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удалить пользователя (только админ)
router.delete('/:id', authMiddleware('admin'), async (req, res) => {
    try {
        const user = await db.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Логируем удаление
        console.log(`User ${user.id} deleted`);

        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Прикрепить студента к группе (только админ)
router.post('/:id/assign-group', authMiddleware('admin'), async (req, res) => {
    try {
        const { groupId } = req.body;
        const user = await db.User.findByPk(req.params.id, {
            include: [db.Student],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Проверяем, что пользователь является студентом
        if (user.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Проверяем, существует ли группа
        const group = await db.Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Прикрепляем студента к группе
        if (!user.Student) {
            await db.Student.create({ userId: user.id, groupId });
        } else {
            user.Student.groupId = groupId;
            await user.Student.save();
        }

        res.status(200).json({ message: 'Student assigned to group', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Прикрепить преподавателя к предмету (только админ)
router.post('/:id/assign-subject', authMiddleware('admin'), async (req, res) => {
    try {
        const { subjectId } = req.body;
        const user = await db.User.findByPk(req.params.id, {
            include: [db.Teacher],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Проверяем, что пользователь является преподавателем
        if (user.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        // Проверяем, существует ли предмет
        const subject = await db.Subject.findByPk(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Прикрепляем преподавателя к предмету
        if (!user.Teacher) {
            await db.Teacher.create({ userId: user.id });
        }
        subject.teacherId = user.Teacher.id;
        await subject.save();

        res.status(200).json({ message: 'Teacher assigned to subject', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;