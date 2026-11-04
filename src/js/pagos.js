// archivo: src/js/pagos.js (reemplaza solo esta función)
  function iniciarAparicion(elementos) {
    // Sin animación o sin soporte: no ocultamos nada
    if (reducirMovimiento || !('IntersectionObserver' in window)) return;

    seccion.classList.add('js-reveal');

    const mostrar = (el) => el.classList.add('is-visible');

    const observador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        mostrar(entrada.target);
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.1 });

    elementos.forEach((el) => observador.observe(el));

    // Seguro: si algo falla, a los 2.5 s se muestra todo igual
    setTimeout(() => elementos.forEach(mostrar), 2500);
  }