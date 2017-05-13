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
      getByAccount: async (account) => {
        const balance = await Balance.findOne({
          where: { account },
        });
        if (!balance) throw new AccountNotFoundException('account does not exist');
        return balance;
      },
      transfer: async (from, to, amount) => {
        const Transaction = sequelize.import('./transaction');
        // check if the sender and receiver accounts exist
        const [balanceFrom, balanceTo] = await Promise.all([
          Balance.getByAccount(from),
          Balance.getByAccount(to),
        ]);
        // check if the balance of the sender account is bigger than the amount to transfer
        if (balanceFrom.balance < amount) {
          throw new BalanceNotSufficientException('amount is bigger than the current balance');
        }

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
             WHERE account = ${from}`, { transaction: t }),
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
               WHERE account = ${to}`, { transaction: t }),
          ]);
        };
        return sequelize.transaction(t =>
          decreaseBalance(t, from, amount)
              .then(() => increaseBalance(t, to, amount)))
          .then(() => {
            console.log('all committed');
          }).catch((err) => {
            console.log('rolled back');
            console.log(err);
          });
      },
    },
    timestamps: false,
  },
  );
  return Balance;
};

