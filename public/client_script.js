


// Cart to store selected items
const cart = [];

// Event listener for "Add to Cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);

    // Check if the item is already in the cart
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
      // If the item is already in the cart, increase the quantity
      existingItem.quantity += 1;
    } else {
      // If the item is not in the cart, add it with quantity 1
      cart.push({ name, price, quantity: 1 });
    }

    updateCart();
  });
});


function updateCart() {
  const cartItemsContainer = document.querySelector('.cart-items-container');

  // Clear the cart items container before updating
  cartItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('cart-item');

    const itemDetails = document.createElement('span');
    itemDetails.textContent = `${item.name} - Price: ${item.price} - Quantity: `;
    cartItemDiv.appendChild(itemDetails);

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.classList.add('quantity-button');
    decreaseButton.addEventListener('click', () => {
      decreaseQuantity(item.name);
    });
    cartItemDiv.appendChild(decreaseButton);

    const quantitySpan = document.createElement('span');
    quantitySpan.textContent = item.quantity;
    cartItemDiv.appendChild(quantitySpan);

    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.classList.add('quantity-button');
    increaseButton.addEventListener('click', () => {
      increaseQuantity(item.name);
    });
    cartItemDiv.appendChild(increaseButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'X';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', () => {
      removeFromCart(item.name);
    });
    cartItemDiv.appendChild(removeButton);

    cartItemsContainer.appendChild(cartItemDiv);
  });

  // Show the cart container on the right side of the screen
  const cartContainer = document.querySelector('#cart-container');
  cartContainer.style.display = 'block';

  // Calculate the total price
  const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  // Display the total price
  const totalContainer = document.querySelector('#total-container');
  totalContainer.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}


// Function to increase the quantity of an item in the cart
function increaseQuantity(name) {
  const item = cart.find((item) => item.name === name);
  if (item) {
    item.quantity += 1;
    updateCart();
  }
}

// Function to decrease the quantity of an item in the cart
function decreaseQuantity(name) {
  const item = cart.find((item) => item.name === name);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    updateCart();
  }
}


function removeFromCart(name) {
  const itemIndex = cart.findIndex((item) => item.name === name);

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    updateCart();
  }
}


// Function to hide the cart container
function hideCart() {
  const cartContainer = document.querySelector('#cart-container');
  cartContainer.style.display = 'none';
}


const menu = document.querySelector('#mobile-menu')
const menuLinks = document.querySelector('.navbar__menu')

menu.addEventListener('click', function () {
  console.log('menu buttton clicked')
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});

// Event listener for the close button in the cart container
const closeButton = document.querySelector('.close-button');
if (closeButton) { // Check if closeButton exists before adding the event listener
  closeButton.addEventListener('click', () => {
    hideCart();
  });
}

// Event listener for the "Get Started" button
const getStartedButton = document.querySelector('.main__btn');
if (getStartedButton) { // Check if getStartedButton exists before adding the event listener
  getStartedButton.addEventListener('click', function () {
    window.location.href = 'dashboard';
  });
}


// Get all the links with the class "show-section"
const showLinks = document.querySelectorAll('.show-section');

// Loop through the links and add click event listeners
showLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    // Get the value of the "data-section" attribute for the clicked link
    const sectionToShow = link.dataset.section;

    // Get all functionality sections
    const functionalitySections = document.querySelectorAll('.functionality-section');

    // Loop through the functionality sections and hide them all
    functionalitySections.forEach((section) => {
      section.classList.remove('show');
    });

    // Show the selected functionality section
    document.getElementById(sectionToShow).classList.add('show');
  });
});



document.addEventListener('DOMContentLoaded', () => {
  const dashboardContent = document.getElementById('dashboard-content');
  const loginContent = document.getElementById('login-content');
  const logoutButton = document.getElementById('logout-button');

  // Function to show the dashboard content and hide the login form
  function showDashboard() {
    dashboardContent.style.display = 'block';
    loginContent.style.display = 'none';
  }

  // Function to show the login form and hide the dashboard content
  function showLogin() {
    dashboardContent.style.display = 'none';
    loginContent.style.display = 'block';
  }

  // Function to handle the login form submission
  function handleLogin(event) {
    event.preventDefault();
    const accountnum = document.getElementById('accountnum').value;
    const password = document.getElementById('password').value;

    // Send a request to the server to authenticate the user
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountnum, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Login successful, show the dashboard
          showDashboard();
          document.getElementById('logged-in-username').innerText = accountnum;
        } else {
          // Login failed, show error message
          document.getElementById('login-error').innerText = data.message;
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        document.getElementById('login-error').innerText = 'Login failed';
      });
  }

  // Add event listener for the login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

// ... Your existing code ...

// Event listener for the "Pay Now" button
const payNowButton = document.querySelector('#pay-now-button');
if (payNowButton) {
   let totalPrice = calculateTotalPrice();
   totalPrice =8
    console.log(totalPrice)
  console.log('hello from paynowbutton')
  payNowButton.addEventListener('click', () => {
    
    handlePayment(totalPrice);
  });
}

function calculateTotalPrice() {
  return cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
}

// Function to handle the payment process
function handlePayment(totalPrice) {
// Check if the user is logged in (using AJAX request to the '/check-login' route)
  fetch('/check-login', { credentials: 'include' })
    .then((response) => response.json())
    .then((data) => {
      console.log('Login check response:', data);
      if (data.isLoggedIn) {
        const accountnum = data.accountnum;
        console.log(accountnum); // Verify the value of accountnum
        console.log(totalPrice); // Verify the value of totalPrice
            makePayment(accountnum,totalPrice);
          } else {
        // User is not logged in, show the login page
        window.location.href = '/login'; // Redirect to the login page
      }
    })
    .catch((error) => {
      console.error('Error checking login status:', error);
      // Handle any errors that occurred during the login check
    });
}


// Function to initiate the payment process
function makePayment(accountnum,totalPrice) {
  console.log('hello from makepayment');
  console.log(accountnum)
   // Assuming you have access to the accountnum here
  
console.log(totalPrice)
   fetch('/deduct-amount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountnum,totalPrice}),
  })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Payment successful, show a success message to the user
          console.log('Payment successful! Amount deducted: $' + totalPrice);
          // Clear the cart after successful payment
          cart.length = 0;
          updateCart();
        } else {
          // Payment failed, show an error message to the user
          console.log('Payment failed.');
        }
      })
      .catch((error) => {
        console.error('Error during payment:', error);
        // Handle any errors that occurred during the payment process
      });
}


function updateGetStartedButton() {
  // Check if the user is logged in (using AJAX request to the '/check-login' route)
  fetch('/login', { credentials: 'include' }) // Use 'include' to send cookies along with the request
    .then((response) => response.json())
    .then((data) => {
      const getStartedButton = document.getElementById('getStartedButton');
      if (data.isLoggedIn) {
        // User is logged in, update the button text and click event
        getStartedButton.innerText = 'Continue to Dashboard';
        getStartedButton.addEventListener('click', () => {
          window.location.href = '/dashboard';
        });
      } else {
        // User is not logged in, update the button text and click event
        getStartedButton.innerText = 'Get Started';
        getStartedButton.addEventListener('click', () => {
          window.location.href = '/login';
        });
      }
    })
    .catch((error) => {
      console.error('Error checking login status:', error);
      // Handle any errors that occurred during the login check
    });
}

updateGetStartedButton();





