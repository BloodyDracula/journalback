module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: DataTypes.STRING,
    });

    Group.associate = (models) => {
        Group.hasMany(models.Student, { foreignKey: 'groupId' });
    };

    return Group;
};