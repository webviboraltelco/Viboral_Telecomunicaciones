// archivo: src/js/pagos.js
(() => {
  const seccion = document.querySelector('.pagos');
  if (!seccion) return; // La sección no existe en esta página

  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const INCLINACION_MAXIMA = 6; // grados

  iniciarAparicion(seccion.querySelectorAll('.reveal'));
  iniciarVisor();

  if (punteroFino && !reducirMovimiento) {
    seccion.querySelectorAll('.factura').forEach(iniciarInclinacion);
  }

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

  function iniciarInclinacion(tarjeta) {
    let frame = null;

    tarjeta.addEventListener('pointermove', (evento) => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const rect = tarjeta.getBoundingClientRect();
        const x = (evento.clientX - rect.left) / rect.width;
        const y = (evento.clientY - rect.top) / rect.height;

        tarjeta.style.setProperty('--mx', `${x * 100}%`);
        tarjeta.style.setProperty('--my', `${y * 100}%`);
        tarjeta.style.setProperty('--ry', `${(x - 0.5) * INCLINACION_MAXIMA * 2}deg`);
        tarjeta.style.setProperty('--rx', `${(0.5 - y) * INCLINACION_MAXIMA * 2}deg`);
      });
    });

    tarjeta.addEventListener('pointerleave', () => {
      if (frame) cancelAnimationFrame(frame);
      tarjeta.style.setProperty('--rx', '0deg');
      tarjeta.style.setProperty('--ry', '0deg');
    });
  }

  function iniciarVisor() {
    const visor = document.getElementById('visorFactura');
    if (!visor || typeof visor.showModal !== 'function') return;

    const imagen = visor.querySelector('.visor__imagen');
    const titulo = visor.querySelector('.visor__titulo');
    const cerrar = visor.querySelector('.visor__cerrar');

    seccion.querySelectorAll('[data-visor-src]').forEach((boton) => {
      boton.addEventListener('click', () => {
        imagen.src = boton.dataset.visorSrc;
        imagen.alt = boton.querySelector('img')?.alt ?? '';
        titulo.textContent = boton.dataset.visorTitulo ?? '';
        visor.showModal();
      });
    });

    cerrar.addEventListener('click', () => visor.close());

    // Cerrar al hacer clic en el fondo oscuro (fuera de la caja)
    visor.addEventListener('click', (evento) => {
      if (evento.target === visor) visor.close();
    });
  }
})();
