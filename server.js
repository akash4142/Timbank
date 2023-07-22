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



// Configure multer to store uploaded files in the 'uploads' folder

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
Handlebars.create({ allowProtoPropertiesByDefault: true });

// Configure express-handlebars
// Configure express-handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main', // Specify the default layout as 'main.hbs'
  layoutsDir: path.join(__dirname, 'views', 'layouts') // Set the directory for layout files
}));

const storage = multer.diskStorage({
  destination: '/tmp/uploads', // Use the temporary directory /tmp/uploads
  filename: function (req, file, cb) {
    // Your filename logic here, if needed
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
  res.sendFile(path.join(__dirname, '/views/about.html'));
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
      // Add other properties from req.body as needed
    };

    customers.addCustomer(newItem)
      .then((data) => {
        console.log('New customer data:', data); // Log the data entered by the user
        res.redirect('/customers');
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ message: 'Failed to add customer' });
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


// Login route
app.get('/login', (req, res) => {
  res.render('login', { layout: false });
});

app.post('/login', (req, res) => {
  const accountnum = req.body.accountnum;
  const password = req.body.password;

  customers.login({ accountnum, password })
  .then((customer) => {
    if (customer) {
      // User authentication successful, redirect to the payment details page
      res.redirect('/payment-details');
    } else {
      // User authentication failed, redirect back to the login page with an error message
      res.redirect('/login?error=1');
    }
  })
  .catch((error) => {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
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




// Route to handle payment processing after the user clicks "Pay Now" and is logged in
app.get('/payment-details', (req, res) => {
  
  if(req.body){
  const {accountnum} = req.body;
  const totalAmount = customers.calculateTotalAmountFromCart(req); // Implement a function to calculate the total amount from the user's cart

  // Call the deductAmount function to deduct the total amount from the user's account
  customers.deductAmount(accountnum, totalAmount)
    .then(() => {
      // Deduction successful, process the order
      // Save the order details to the database or perform any other required actions
      // For simplicity, we'll simulate order success for this example
      const orderSuccess = true;
        if (orderSuccess) {
          // Redirect the user to the "Order Received" page
          res.redirect('/order-received');
        } else {
          // Handle payment failure
          res.status(500).json({ success: false, message: 'Payment failed' });
        }
      })
      .catch((error) => {
        console.error('Error deducting payment:', error);
        res.status(500).json({ success: false, message: 'Payment failed' });
      });
  } else {
    // User is not logged in, send a 401 unauthorized status
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});


// app.post('/process-payment')
app.post('/process-payment', (req, res) => {
  const { accountnum, password } = req.body; // Assuming the form sends 'accountnum' and 'password' fields

  // Authenticate the user based on account number and password
  customers.authenticateUser(accountnum, password)
    .then((userId) => {
      if (userId) {
        // User authentication successful, proceed with payment processing
        const totalAmount = customers.calculateTotalAmountFromCart(req); // Implement a function to calculate the total amount from the user's cart

        // Call the deductAmount function to deduct the total amount from the user's account
        customers.deductAmount(accountnum, totalAmount)
          .then(() => {
            // Deduction successful, process the order
            // Save the order details to the database or perform any other required actions
            // For simplicity, we'll simulate order success for this example
            const orderSuccess = true;
            if (orderSuccess) {
              res.json({ success: true });
            } else {
              res.json({ success: false });
            }
          })
          .catch((error) => {
            console.error('Error deducting amount:', error);
            res.json({ success: false });
          });
      } else {
        // User authentication failed, return failure response
        res.json({ success: false, message: 'Invalid login credentials. Please try again.' });
      }
    })
    .catch((error) => {
      console.error('Error authenticating user:', error);
      res.json({ success: false });
    });
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
