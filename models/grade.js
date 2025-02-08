module.exports = (sequelize, DataTypes) => {
    const Grade = sequelize.define('Grade', {
        grade: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        studentId: DataTypes.INTEGER,
        subjectId: DataTypes.INTEGER,
    });

    Grade.associate = (models) => {
        Grade.belongsTo(models.Student, { foreignKey: 'studentId' });
        Grade.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    };

    return Grade;
};