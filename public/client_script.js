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


function hideCart() {
  const cartContainer = document.getElementById('cart-container');
  cartContainer.style.display = 'none';
}

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

  // TODO: Add event listeners for the functionality links (delete, update, withdraw, transfer, account details) to show/hide the respective sections

  // TODO: Add event listener for the logout button to log out the user and show the login form again

  // TODO: Add code to check the login status when the page loads and show the appropriate content (dashboard or login form) based on that

  // You can add more JavaScript code as needed to handle other functionalities and interactions on the dashboard page
});





