const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const customers = require('./functions');
const app = express();
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { readDataFromFile } = require('./scripts');
const session = require('express-session')
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');

// Configure multer to store uploaded files in the 'uploads' folder

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set this to true if using HTTPS in production
    genid: (req) => {
      return req.body.accountnum; // Use the accountnum as the session identifier
    },
  })
);

// Configure express-handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main', // Specify the default layout as 'main.hbs'
  layoutsDir: path.join(__dirname, 'views', 'layouts'), // Set the directory for layout files
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
  },
}));

const storage = multer.diskStorage({
  destination: '/tmp/uploads', // Use the temporary directory /tmp/uploads
  filename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


app.set('view engine', 'hbs');


cloudinary.config({
  cloud_name: 'dw7mvgct4',
  api_key: '193259821489367',
  api_secret: '4eNYjlIs2RIbSoe5oMrZDLS8R8w',
  secure: true,
});

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log('Server is listening on port: ' + HTTP_PORT);
}

app.get('/', (req, res) => {
  res.render('home',{layout:false});
});

app.get('/customers', function (req, res) {
  customers
    .getAllCustomers()
    .then((customers) => {
      console.log('Customers passed to the template:', customers);
      res.render('customers', { customers: customers, layout: false });
    })
    .catch((err) => {
      console.log('Error:', err);
      res.send('Error: ' + err);
    });
});



app.get('/about', function (req, res) {
  res.render('about',{layout:false});
});

app.get('/newcustomer', function (req, res) {
  res.render('newcustomer',{layout:false});
});

app.post('/newcustomer', upload.single('featureImage'), (req, res) => {
  console.log(req.body)
  if (req.file) {
    const streamupload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function uploadImage(req) {
      try {
        const result = await streamupload(req);
        console.log(result);
        return result;
      } catch (error) {
        console.log(error);
        throw new Error('Image upload failed');
      }
    }

    uploadImage(req)
      .then((uploaded) => {
        console.log('done');
        processItem(uploaded.url);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: 'Image upload failed' });
      });
  } else {
    processItem('');
  }
  

  function processItem(imageUrl) {
    const newItem = {
      featureImage: imageUrl,
      name: req.body.name,
      accountnum: req.body.accountnum,
      amount: req.body.amount,
      gender: req.body.gender,
      password: req.body.password,
      
    };

    customers.addCustomer(newItem)
      .then((data) => {
        console.log('New customer data:', data);
        res.redirect('/newcustomer');
      })
      .catch((error) => {
        console.log(error);
        res.render('newcustomer', { layout: false, errorMessage: 'Error creating new customer' });
      });
  }
});


// Route to handle the form submission and delete the account
app.post('/delete', (req, res) => {
  const accountnumToDelete = req.body.accountnum;

  // Call the deleteCustomerByAccountNum function to delete the account
  customers.deleteCustomerByAccountNum(accountnumToDelete)
    .then((rowsDeleted) => {
      // Account deleted successfully, redirect to the customers' page
      res.redirect('/customers');
    })
    .catch((err) => {
      res.send(`Error deleting account: ${err.message}`);
    });
});

app.get('/check-login', (req, res) => {
  if (req.session.accountnum) {
    // User is logged in
    const accountnum = req.session.accountnum;
    res.json({ isLoggedIn: true, accountnum: accountnum });
  } else {
    // User is not logged in
    res.json({ isLoggedIn: false, accountnum: null });
  }
});


// Add a new route to handle deduction of amount
app.post('/deduct-amount', (req, res) => {
  const {accountnum , totalPrice} = req.session;
 
  console.log(accountnum)
  console.log(totalPrice);
  customers.deductAmount(accountnum,totalPrice)
    .then(() => {
      console.log('Amount deducted successfully');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error deducting amount:', error);
      res.status(500).json({ success: false, message: 'Failed to deduct amount' });
    });
});



// Route to handle the payment process
app.post('/pay-now', (req, res) => {
  
  // Check if the user is logged in (You should have middleware to handle session authentication)
  if (!req.session.accountnum) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  // Retrieve the total price from the request body
  const totalPrice = parseFloat(req.body.totalPrice);

  // Find the user in the userAccounts object based on the logged-in accountnum
  const accountnum = req.session.accountnum;
  const user = customers.getCustomerBycustomernum(accountnum);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Check if the user has enough balance for the payment
  if (user.balance >= totalPrice) {
    // Deduct the amount from the user's balance
    user.balance -= totalPrice;

    // Update the customer's data with the new balance
    updateCustomer(accountnum, user);

    // Payment successful, return success response
    return res.status(200).json({ success: true, message: 'Payment successful' });
  } else {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }
});


app.get('/login', (req, res) => {
  const isLoggedIn = req.session.accountnum ? true : false;
  res.render('login', { layout: false, isLoggedIn: isLoggedIn });
});

app.post('/login', (req, res) => {
  const accountnum = req.body.accountnum;
  const password = req.body.password;

  customers.login({ accountnum, password })
  .then((customer) => {
    if (customer) {
      req.session.accountnum = accountnum;
      
      // User authentication successful, redirect to the payment details page
      res.redirect('/dashboard');
    } else {
      // User authentication failed, redirect back to the login page with an error message
      res.render('login', { layout: false, isLoggedIn: false, errorMessage: 'Invalid accountnum or password' });
    }
  })
  .catch((error) => {
    console.error('Error during login:', error);
    res.render('login', { layout: false, isLoggedIn: false, errorMessage: 'Invalid accountnum or password' });
  });
});


// Route for '/timhortons' that renders the 'timhortons.hbs' file
app.get('/timhortons', async (req, res) => {
  try {
    // Load the data from JSON files using Promises
    const hotBeverages = await readDataFromFile(path.join(__dirname, 'data/hotBeverages.json'));
    const coldBeverages = await readDataFromFile(path.join(__dirname, 'data/coldBeverages.json'));
    const bakedGoods = await readDataFromFile(path.join(__dirname, 'data/bakedGoods.json'));

    // Render the 'timhortons.hbs' file with the loaded data
    res.render('timhortons', {
      layout: false,
      hotBeverages: hotBeverages,
      coldBeverages: coldBeverages,
      bakedGoods: bakedGoods
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).send('Error reading data');
  }
});

app.get('/dashboard', (req, res) => {
  // Check if the user is logged in (i.e., their user ID is stored in the session)
  if (!req.session.accountnum) {
    // If the user is not logged in, redirect them to the login page
    return res.redirect('/login');
  }

  // Assuming you have a function to fetch a customer by their user ID
  customers.getCustomerBycustomernum(req.session.accountnum)
    .then((customer) => {
      // Render the dashboard page with the customer data and other functionality
      res.render('dashboard', { layout: false, customer: customer });
    })
    .catch((error) => {
      console.error('Error fetching customer:', error);
      res.status(500).json({ message: 'Failed to fetch customer' });
    });
});

// Logout route
app.get('/logout', (req, res) => {
  // Destroy the session and remove the accountnum from the session data
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
    }
    // Redirect to the login page after logout
    res.redirect('/login');
  });
});

app.post('/update-account', (req, res) => {
  const { accountnum, name, password } = req.body;

  // Assuming you have a function to update customer details in the database
  // You can update the details based on the "accountnum" and "name" values received from the form
  customers.updateAccount({ accountnum, name, password })
    .then(() => {
      // Account details updated successfully, you can redirect to the dashboard or show a success message
      res.redirect('/customers');
    })
    .catch((error) => {
      // Handle any errors that occurred during the account update process
      console.error('Error updating account:', error);
      res.status(500).json({ message: 'Account update failed' });
    });
});


// Route to handle the withdrawal form submission
app.post('/withdraw', (req, res) => {
  const accountnum = req.body.accountnum;
  const amount = parseFloat(req.body.amount);

  // Check if the amount is valid (greater than 0)
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  // Assuming you have a function to handle the withdrawal process in your "functions.js" file
  customers.withdrawAmount(accountnum, amount)
    .then(() => {
      // Withdrawal successful
      res.json({ success: true, message: 'Withdrawal successful' });
   
    })
    .catch((error) => {
      // Withdrawal failed due to insufficient funds or other errors
      console.error('Error during withdrawal:', error);
      res.status(500).json({ success: false, message: 'Withdrawal failed' });
    });
});


// Route to handle the transfer form submission
app.post('/transfer', (req, res) => {
  const senderAccount = req.body.senderAccount;
  const recipientAccount = req.body.recipientAccount;
  const amount = parseFloat(req.body.amount);

  // Call the performTransaction function to transfer amount between accounts
  customers.performTransaction(senderAccount, recipientAccount, amount)
    .then(() => {
      // Transaction successful, redirect to the dashboard
      res.redirect('/dashboard');
    })
    .catch((err) => {
      // Handle any errors that occurred during the transaction
      console.error('Error performing transaction:', err);
      res.status(500).json({ message: 'Transaction failed' });
    });
});


// Route to handle the customer details page
app.get('/customer/:accountnum', (req, res) => {
  const accountnum = req.params.accountnum;

  // Call the getCustomerDetails function to retrieve the customer details
  customers.getCustomerDetails(accountnum)
    .then((accountDetails) => {
      console.log(accountDetails.name)
      // Render the customer details page with the account details data
      res.render('customer', { layout: false, accountDetails: accountDetails });
    })
    .catch((error) => {
      console.error('Error fetching customer details:', error);
      res.status(500).json({ message: 'Failed to fetch customer details' });
    });
});

// Route to handle the form submission and fetch customer details
app.post('/account-details', (req, res) => {
  const accountnum = req.body.accountnum;

  // Redirect to the customer details page for the provided account number
  res.redirect(`/customer/${accountnum}`);
});





app.use((req, res, next) => {
  res.status(404).render('404error', { layout: false });
});

customers
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.error(err);
  });
