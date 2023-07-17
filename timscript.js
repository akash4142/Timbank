window.addEventListener('DOMContentLoaded', () => {
    const orderButtons = document.querySelectorAll('.order-button');
    const modal = document.getElementById('order-modal');
    const closeButton = document.querySelector('.close-button');
    const confirmButton = document.getElementById('confirm-button');
    const quantityInput = document.getElementById('quantity-input');
    const orderStatus = document.getElementById('order-status');
  
    orderButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.style.display = 'block';
      });
    });
  
    closeButton.addEventListener('click', () => {
      modal.style.display = 'none';
      quantityInput.value = 1;
      orderStatus.textContent = '';
    });
  
    confirmButton.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value);
      if (isNaN(quantity) || quantity < 1) {
        orderStatus.textContent = 'Invalid quantity. Please enter a valid number.';
      } else {
        orderStatus.textContent = `Order confirmed for ${quantity} item(s).`;
      }
    });
  });
  