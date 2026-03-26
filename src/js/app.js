document.addEventListener('DOMContentLoaded', function(){


    envetListeners();

});

function envetListeners(){
    const mobileMenu = document.querySelector('.mobile-menu');

    mobileMenu.addEventListener('click', navegacionResponsive);

    function navegacionResponsive(){
        const navegacion = document.querySelector('.navegacion');

       navegacion.classList.toggle('mostrar');
      

    }
}