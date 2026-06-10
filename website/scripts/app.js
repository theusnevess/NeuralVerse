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

  // Support basic active state for navigation items
  const navItems = document.querySelectorAll('.nv-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (event) => {
      const href = item.getAttribute('href');
      if (href === '#' || href === '') {
        event.preventDefault();
      }

      // Clear aria-current from all nav items
      navItems.forEach(nav => {
        nav.removeAttribute('aria-current');
      });

      // Set aria-current on the active item
      item.setAttribute('aria-current', 'page');
      console.log(`Navigation target updated to: ${item.querySelector('.nv-nav-label')?.textContent || 'Unknown'}`);
    });
  });
});
