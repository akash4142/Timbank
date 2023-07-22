// Client-side JavaScript code

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
  const cartContainer = document.getElementById('cart-container');
  const totalContainer = document.getElementById('total-container');
  cartContainer.innerHTML = '';
  
  let totalPrice = 0;

  cart.forEach((item) => {
    const cartItemDiv = document.createElement('div');
    cartItemDiv.classList.add('cart-item');
    cartItemDiv.textContent = `${item.name} - Price: ${item.price}`;
    cartContainer.appendChild(cartItemDiv);

    // Calculate the total price
    totalPrice += parseFloat(item.price);
  });

  // Display the total price
  totalContainer.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
}
