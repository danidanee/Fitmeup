/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    source: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'user',
        key: 'ID'
      }
    },
    target: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'user',
        key: 'ID'
      }
    },
    contents: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    readed: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0
    }
  }, {
    tableName: 'message'
  });
};
