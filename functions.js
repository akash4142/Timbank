const fs = require('fs');
const path = require('path');

let customers = [];

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('./data/customers.json'), 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          customers = JSON.parse(data);
          resolve();
        } catch (err) {
          reject('Error parsing customers data');
        }
      }
    });
  });
};


module.exports.saveCustomersToFile = function() {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(customers, null, 2);
    fs.writeFile(path.resolve('./data/customers.json'), jsonData, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports.getAllCustomers = function() {
  return new Promise((resolve, reject) => {
    customers.length > 0 ? resolve(customers) : reject('No results');
  });
};


module.exports.getcustomersById = function (id) {
    return new Promise((resolve, reject) => {
      const customer = customers.find((customer) => customer.id.toString() === id);
  
      if (!customer) {
        reject('No result returned');
      }
  
      resolve(customer);
    });
  };


module.exports.addcustomer = function(data){
  return new Promise((resolve, reject) => {
    

    data.id = customers.length + 1;
    customers.push(data);
    this.saveCustomersToFile();
    resolve(data);
  })
}

module.exports.login = function(data) {
  return new Promise((resolve, reject) => {
    const { accountnum, password } = data;

    
    const customer = customers.find((customer) => {
      return customer.accountnum === accountnum ;
    });

    if (customer) {
      console.log('login success');
      resolve(customer);
    } else {
      console.log('No match found');
      reject('No match found');
    }
  });
};