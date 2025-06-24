document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.flip-card').forEach(card => {
    // Toggle flip on click
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    // Remove flip when mouse leaves
    card.addEventListener('mouseleave', () => {
      card.classList.remove('flipped');
    });
  });
});
