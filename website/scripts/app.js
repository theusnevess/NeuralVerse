/**
 * NeuralVerse MVP App Shell Initialization
 * v0.1
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('NeuralVerse App Shell Initialized');

  // Set the current year in the footer
  const yearElement = document.querySelector('.nv-footer-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
});
