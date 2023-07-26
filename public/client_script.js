// Cart to store selected items
const cart = [];

// Event listener for "Add to Cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
addToCartButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = button.dataset.price;
    cart.push({ name, price });
    updateCart();
  });
});

// Function to update the cart items on the client-side
function updateCart() {
  const cartItemsContainer = document.querySelector('.cart-items-container');

  // Clear the cart items container before updating
  cartItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('cart-item');
    cartItemDiv.textContent = `${item.name} - Price: ${item.price}`;
    cartItemsContainer.appendChild(cartItemDiv);
  });

  // Show the cart container on the right side of the screen
  const cartContainer = document.querySelector('#cart-container');
  cartContainer.style.display = 'block';

  // Calculate the total price
  const totalPrice = cart.reduce((total, item) => total + parseFloat(item.price), 0);

  // Display the total price
  const totalContainer = document.querySelector('#total-container');
  totalContainer.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}

// // Event listener for "Pay Now" button click
// const payNowButton = document.querySelector('#pay-now-button');
// payNowButton.addEventListener('click', () => {
//   // Implement the logic for payment processing here (e.g., redirect to a payment gateway).
//   // For this example, we will just reset the cart and hide the cart container.
//   cart.length = 0;
//   updateCart();
// });

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







