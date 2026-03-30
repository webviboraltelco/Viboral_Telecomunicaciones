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

