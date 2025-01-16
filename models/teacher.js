module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
        name: DataTypes.STRING,
        userId: DataTypes.INTEGER,
    });

    Teacher.associate = (models) => {
        Teacher.belongsTo(models.User, { foreignKey: 'userId' });
        Teacher.hasMany(models.Subject, { foreignKey: 'teacherId' });
    };

    return Teacher;
};