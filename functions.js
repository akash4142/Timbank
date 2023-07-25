const { Sequelize, DataTypes } = require('sequelize');

// postgrad database 
const sequelize = new Sequelize('rvjobrka', 'rvjobrka', 'WrPpsx9tZ1lRDuTUxALe2fYDyaeMDFMJ', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
});

//customer model 
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  accountnum: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
});

// initializing the data from database
module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    Customer.sync()
  .then(() => {
    console.log('Database synced successfully.');
    resolve();
  })
  .catch((err) => {
    console.error('Unable to sync the database:', err);
    reject(new Error('Unable to sync the database'));
  });
  });
};

// Save customers to the database
module.exports.saveCustomersToDatabase = function(customers) {
  return new Promise((resolve, reject) => {
    Customer.bulkCreate(customers, { updateOnDuplicate: ['accountnum'] })
      .then(() => resolve())
      .catch(err => reject(err));
  });
};

// Get all customers from the database
// In the getAllCustomers function
module.exports.getAllCustomers = function() {
  return Customer.findAll()
    .then(customers => {
      // Convert Sequelize objects to plain JSON objects
      const plainCustomers = customers.map(customer => customer.get({ plain: true }));
      return plainCustomers;
    })
    .catch(err => {
      console.error('Error fetching customers:', err);
      throw err;
    });
};

// Delete a customer by account number from the database
module.exports.deleteCustomerByAccountNum = function(accountnum) {
  return new Promise((resolve, reject) => {
    Customer.destroy({
      where: { accountnum: accountnum },
    })
    .then((rowsDeleted) => {
      if (rowsDeleted > 0) {
        console.log('Account deleted successfully');
        resolve(rowsDeleted);
      } else {
        console.log('No account found with the specified account number');
        reject(new Error('No account found with the specified account number'));
      }
    })
    .catch(err => reject(err));
  });
};

// Function to calculate the total amount from the user's cart
module.exports.calculateTotalAmountFromCart = function (req) {
  return new Promise((resolve, reject) => {
    // You can implement the logic here to calculate the total amount from the cart
    // For example, iterate through the cart array in req.body and sum up the prices
    let totalAmount = 0;
    if (req.body.cart) {
      for (const item of req.body.cart) {
        totalAmount += parseFloat(item.price);
      }
    }
    resolve(totalAmount);
  });
};


// Get a customer by account number from the database
module.exports.getCustomerBycustomernum = function(accountnum) {
  return new Promise((resolve, reject) => {
    Customer.findOne({
      where: { accountnum: accountnum },
    })
      .then(customer => {
        if (customer) {
          resolve(customer);
        } else {
          reject(new Error('No customer found with the specified account number'));
        }
      })
      .catch(err => reject(err));
  });
};


// Add a customer to the database
module.exports.addCustomer = function(data) {
  return new Promise((resolve, reject) => {
    Customer.create(data)
      .then(createdCustomer => resolve(createdCustomer))
      .catch(err => reject(err));
  });
};

// Login a customer based on accountnum and password
module.exports.login = function(data) {
  const { accountnum, password } = data;

  return new Promise((resolve, reject) => {
    Customer.findOne({
      where: { accountnum: accountnum, password: password }, // Check both accountnum and password
    })
    .then(customer => {
      if (customer) {
        console.log('Login success');
        resolve(customer);
      } else {
        console.log('No match found');
        reject(new Error('No match found'));
      }
    })
    .catch(err => reject(err));
  });
};



// Function to update customer account details in the database
module.exports.updateAccount = function(data) {
  const { accountnum, name, password } = data;

  return new Promise((resolve, reject) => {
    Customer.findOne({
      where: { accountnum: accountnum },
    })
    .then(customer => {
      if (customer) {
        // Update the customer's details with the new values
        customer.update({ name: name, password: password })
          .then(() => {
            console.log('Account updated successfully');
            resolve();
          })
          .catch((err) => {
            console.error('Error updating account:', err);
            reject(new Error('Failed to update account'));
          });
      } else {
        console.log('Customer not found');
        reject(new Error('Customer not found'));
      }
    })
    .catch(err => reject(err));
  });
};


// Function to withdraw amount from a customer's account
module.exports.withdrawAmount = function(accountnum, amount) {
  
  return new Promise((resolve, reject) => {
    Customer.findOne({
      where: { accountnum: accountnum },
    })
      .then((customer) => {
        if (!customer) {
          // If customer not found, reject with an error message
          reject(new Error('Customer not found'));
        } else {
          // Check if the customer has sufficient balance for the withdrawal
          if (customer.amount >= amount) {
            // Calculate the updated balance after withdrawal
            const updatedBalance = customer.amount - amount;

            // Update the customer's balance in the database
            customer.update({ amount: updatedBalance })
              .then(() => {
                console.log('Withdrawal successful');
                resolve();
              })
              .catch((err) => {
                console.error('Error updating customer balance:', err);
                reject(new Error('Failed to withdraw amount'));
              });
          } else {
            
            reject(new Error('Insufficient funds'));
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching customer:', err);
        reject(new Error('Failed to withdraw amount'));
      });
  });
};


// Function to perform a transaction (transfer money to another account)
module.exports.performTransaction = function(senderAccountNum, recipientAccountNum, amount) {
  senderAccountNum = senderAccountNum.toString();
  recipientAccountNum = recipientAccountNum.toString();
  return new Promise((resolve, reject) => {
    // Get the sender and recipient customers using their account numbers
    let sender, recipient;
    module.exports.getCustomerBycustomernum(senderAccountNum) // Use module.exports to access the getCustomerBycustomernum function
      .then(senderCustomer => {
        sender = senderCustomer;
        return module.exports.getCustomerBycustomernum(recipientAccountNum); // Use module.exports to access the getCustomerBycustomernum function
      })
      .then(recipientCustomer => {
        recipient = recipientCustomer;
        // Perform the transaction only if both sender and recipient are found
        if (!sender || !recipient) {
          reject(new Error('Invalid sender or recipient account number'));
        } else if (sender.amount < amount) {
          reject(new Error('Insufficient funds'));
        } else {
          // Deduct the amount from the sender's account and update both sender and recipient accounts
          const updatedSenderAmount = sender.amount - amount;
          const updatedRecipientAmount = recipient.amount + amount;

          // Update the sender and recipient amounts in the database
          sender.update({ amount: updatedSenderAmount })
            .then(() => {
              recipient.update({ amount: updatedRecipientAmount })
                .then(() => {
                  console.log('Transaction successful');
                  resolve();
                })
                .catch(error => {
                  console.error('Error updating recipient amount:', error);
                  reject(new Error('Transaction failed'));
                });
            })
            .catch(error => {
              console.error('Error updating sender amount:', error);
              reject(new Error('Transaction failed'));
            });
        }
      })
      .catch(error => {
        console.error('Error fetching sender or recipient:', error);
        reject(new Error('Transaction failed'));
      });
  });
};


// Function to get customer details by account number
module.exports.getCustomerDetails = function(accountnum) {
  return new Promise((resolve, reject) => {
    module.exports.getCustomerBycustomernum(accountnum)
      .then((accountDetails) => {
        // If customer details found, resolve with the data
        resolve(accountDetails);
      })
      .catch((error) => {
        console.error('Error fetching customer details:', error);
        reject(new Error('Failed to fetch customer details'));
      });
  });
};