module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('admin', 'student', 'teacher'),
    });

    User.associate = (models) => {
        User.hasOne(models.Student, { foreignKey: 'userId' });
        User.hasOne(models.Teacher, { foreignKey: 'userId' });
    };

    return User;
};