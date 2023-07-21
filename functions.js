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
    primaryKey: true,
    autoIncrement: true,
  },
  accountnum: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Add other customer fields as needed
  // For example:
  // name: { type: DataTypes.STRING, allowNull: false },
  // password: { type: DataTypes.STRING, allowNull: false },
});

// Initialize the database connection and sync the model
module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
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
      where: { accountnum: accountnum },
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
