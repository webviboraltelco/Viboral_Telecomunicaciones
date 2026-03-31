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

// archivo: src/js/pdf-viewer.js

document.addEventListener('DOMContentLoaded', () => {
  const visor = document.querySelector('.pdf-visor');
  const fallback = document.querySelector('.pdf-fallback');

  if (!visor) return;

  // Si Google Docs no carga (sin internet, bloqueado, etc.)
  visor.addEventListener('error', () => {
    visor.style.display = 'none';
    fallback.style.display = 'block';
  });
});