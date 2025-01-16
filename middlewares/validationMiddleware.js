const { body, validationResult } = require('express-validator');

function validateStudent() {
    return [
        body('name').notEmpty().withMessage('Name is required'),
        body('groupId').isInt().withMessage('Group ID must be an integer'),
        body('userId').isInt().withMessage('User ID must be an integer'),
    ];
}

function validationMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = { validateStudent, validationMiddleware };