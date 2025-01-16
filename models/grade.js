module.exports = (sequelize, DataTypes) => {
    const Grade = sequelize.define('Grade', {
        grade: DataTypes.INTEGER,
        studentId: DataTypes.INTEGER,
        subjectId: DataTypes.INTEGER,
    });

    Grade.associate = (models) => {
        Grade.belongsTo(models.Student, { foreignKey: 'studentId' });
        Grade.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    };

    return Grade;
};