'use strict';
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize
    .define('Service', {
      name: DataTypes.STRING
    }, {});
  Service.associate = function(models) {
    // associations can be defined here
  };
  return Service;
};