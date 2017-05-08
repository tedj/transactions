module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    account: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
  return Transaction;
};
