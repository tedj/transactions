import Sequelize from 'sequelize';
import uuid from 'uuid';

function AccountNotFoundException(message) {
  this.message = message;
  this.name = 'AccountNotFound';
  this.code = 404;
}

function BalanceNotSufficientException(message) {
  this.message = message;
  this.name = 'BalanceNotSufficient';
  this.code = 422;
}
module.exports = (sequelize, DataTypes) => {
  const Balance = sequelize.define('Balance', {
    account: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
  }, {
    classMethods: {
      getByAccountWithTransaction: async (account, t) => {
        const balance = await Balance.findOne({
          where: { account },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!balance) throw new AccountNotFoundException('account does not exist');
        return balance;
      },
      getByAccount: async (account) => {
        const balance = await Balance.findOne({
          where: { account },
        });
        if (!balance) throw new AccountNotFoundException('account does not exist');
        return balance;
      },
      transfer: async (from, to, amount) => {
        const Transaction = sequelize.import('./transaction');
        const checkAvailability = async (t) => {
          // check if the sender and receiver accounts exist
          const [balanceFrom, balanceTo] = await Promise.all([
            Balance.getByAccountWithTransaction(from, t),
            Balance.getByAccountWithTransaction(to, t),
          ]);
          // check if the balance of the sender account is bigger than the amount to transfer
          if (balanceFrom.balance < amount) {
            throw new BalanceNotSufficientException('amount is bigger than the current balance');
          }
        };
        const decreaseBalance = async (t) => {
          const reference = uuid.v4();
          const account = from;
          return Promise.all([
            Transaction.create({
              reference,
              account,
              amount,
            }, { transaction: t }),
            sequelize.query(`
             UPDATE Balances SET balance = balance - ${amount}
             WHERE account = ${account}`, { transaction: t }),
          ]);
        };
        const increaseBalance = async (t) => {
          const reference = uuid.v4();
          const account = to;
          return Promise.all([
            Transaction.create({
              reference,
              account,
              amount,
            }, { transaction: t }),
            sequelize.query(`
             UPDATE Balances SET balance = balance + ${amount}
             WHERE account = ${account}`, { transaction: t }),
          ]);
        };
        return sequelize.transaction({
          isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        }, t =>
          checkAvailability(t)
            .then(() => decreaseBalance(t, from, amount)
              .then(() => increaseBalance(t, to, amount))));
      },
    },
    timestamps: false,
  },
  );
  return Balance;
};

