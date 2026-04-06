document.addEventListener("DOMContentLoaded", function () {
  envetListeners();

  darkMode();
});

function darkMode() {
  const botonDarkMode = document.querySelector(".dark-mode-boton");

  botonDarkMode.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
   
  });
}

  function envetListeners() {
    const mobileMenu = document.querySelector(".mobile-menu");

    mobileMenu.addEventListener("click", navegacionResponsive);

    function navegacionResponsive() {
      const navegacion = document.querySelector(".navegacion");

      navegacion.classList.toggle("mostrar");
    }
  }



document.addEventListener('DOMContentLoaded', () => {
  const visor = document.querySelector('.pdf-visor');
  const fallback = document.querySelector('.pdf-fallback');

  if (!visor) return;

  visor.addEventListener('error', () => {
    visor.style.display = 'none';
    fallback.style.display = 'block';
  });
});




document.addEventListener('DOMContentLoaded', () => {
  const banner   = document.getElementById('cookieBanner');
  const btnAceptar  = document.getElementById('cookieAceptar');
  const btnRechazar = document.getElementById('cookieRechazar');

  // Si el usuario ya tomó una decisión antes, no mostramos el banner
  const decision = localStorage.getItem('cookieConsent');
  if (decision) return;

 
  setTimeout(() => {
    banner.classList.add('visible');
  }, 800);

  btnAceptar.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'aceptado');
    cerrarBanner();


    console.log('Cookies aceptadas');
  });

  
  btnRechazar.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'rechazado');
    cerrarBanner();
    console.log('Cookies rechazadas');
  });

  function cerrarBanner() {
    banner.classList.remove('visible');
    banner.classList.add('oculto');
  }
});


// archivo: src/js/whatsapp.js

document.addEventListener('DOMContentLoaded', () => {
  const burbuja = document.getElementById('waBurbuja');
  const btn     = document.getElementById('waBtn');

  if (!burbuja || !btn) return;

  // Muestra la burbuja automáticamente después de 2 segundos
  setTimeout(() => {
    burbuja.classList.add('visible');
  }, 10000);

  // Al hacer clic en el botón, cierra la burbuja y abre WhatsApp
  btn.addEventListener('click', () => {
    burbuja.classList.remove('visible');
  });
});
