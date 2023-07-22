const { Sequelize, DataTypes } = require('sequelize');

// Replace the database connection details with your PostgreSQL credentials
const sequelize = new Sequelize('rvjobrka', 'rvjobrka', 'WrPpsx9tZ1lRDuTUxALe2fYDyaeMDFMJ', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
});

// Define the "Customer" model
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
  // Add other customer fields as needed
});

// Initialize the database connection and sync the model
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



// Get a customer by ID from the database
module.exports.getCustomerById = function(id) {
  return new Promise((resolve, reject) => {
    Customer.findByPk(id)
      .then(customer => {
        if (customer) {
          resolve(customer);
        } else {
          reject(new Error('No result returned'));
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


// Function to deduct the total amount from the user's account
module.exports.deductAmount = function (accountnum, totalAmount) {
  console.log("hrllo");
  return new Promise((resolve, reject) => {
    Customer.findOne({
      where:{accountnum:accountnum}
    })
      .then((customer) => {
        if (customer) {
          // Assuming the customer has a "balance" field representing their account balance
          const updatedBalance = customer.amount - totalAmount;

          if (updatedBalance >= 0) {
            // Update the customer's balance in the database
            customer.update({ amount: updatedBalance })
              .then(() => {
                console.log('Amount deducted successfully');
                resolve();
              })
              .catch((err) => {
                console.error('Error updating customer balance:', err);
                reject(new Error('Failed to deduct amount'));
              });
          } else {
            console.log('Insufficient funds');
            reject(new Error('Insufficient funds'));
          }
        } else {
          console.log('Customer not found');
          reject(new Error('Customer not found'));
        }
      })
      .catch((err) => {
        console.error('Error fetching customer:', err);
        reject(new Error('Failed to deduct amount'));
      });
  });
};
