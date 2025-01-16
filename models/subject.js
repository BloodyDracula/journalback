module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define('Subject', {
        name: DataTypes.STRING,
        teacherId: DataTypes.INTEGER,
    });

    Subject.associate = (models) => {
        Subject.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
        Subject.hasMany(models.Grade, { foreignKey: 'subjectId' });
    };

    return Subject;
};