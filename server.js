const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const customers = require('./functions');
const app = express();
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure multer to store uploaded files in the 'uploads' folder
const upload = multer({ dest: 'uploads/' });
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Configure express-handlebars
// Configure express-handlebars
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main', // Specify the default layout as 'main.hbs'
  layoutsDir: path.join(__dirname, 'views', 'layouts') // Set the directory for layout files
}));


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
      res.render('customers', { customers: customers,layout:false });
    })
    .catch((err) => {
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
      // Add other properties from req.body as needed
    };

    customers
      .addcustomer(newItem)
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


// Login route
app.get('/login', (req, res) => {
  res.render('login', { layout: false });
});

app.post('/login', (req, res) => {
  const accountnum = req.body.accountnum;
  const password = req.body.password;

  customers
    .login({ accountnum, password })
    .then((customer) => {
      console.log(customers.length);
      res.redirect('/customers');
    })
    .catch((error) => {
      console.log("no match found");
      res.status(500).json({ message: 'Login failed' });
    });
});


app.get('/timhortons',(req,res)=>{
  res.render('timhortons',{layout:false});
})

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

customers
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.error(err);
  });
