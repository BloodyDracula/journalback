module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        name: DataTypes.STRING,
        groupId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
    });

    Student.associate = (models) => {
        Student.belongsTo(models.Group, { foreignKey: 'groupId' });
        Student.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Student;
};