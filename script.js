
document.addEventListener('DOMContentLoaded', function(){

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
  
