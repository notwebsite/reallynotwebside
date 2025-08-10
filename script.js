
// Basic interactions for multi-page static site
document.addEventListener('DOMContentLoaded', function(){
  // Contact form demo behavior
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      document.getElementById('contactResult').textContent = 'Köszi, ' + (name||'barátom') + ' — a leveled elvitte a postagalambunk. (Demo, nincs backend.)';
      contactForm.reset();
    });
  }
});
