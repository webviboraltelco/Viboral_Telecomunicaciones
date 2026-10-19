// archivo: src/js/campina.js
// Landing temporal Parcelación La Campiña.
// El bundle se carga en todas las páginas: el guard evita que corra fuera de esta.

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const raiz = document.querySelector('[data-campina]');
    if (!raiz) return;

    const fechaFin = new Date(raiz.dataset.fin);
    if (Number.isNaN(fechaFin.getTime())) {
      console.warn('[campina] data-fin no es una fecha válida');
      return;
    }

    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    mostrarFechaFin(raiz, fechaFin);
    iniciarContador(raiz, fechaFin);
    agregarOrigenWhatsApp();
    iniciarParallax(raiz, reducirMovimiento);
    iniciarApariciones(raiz, reducirMovimiento);
    iniciarPasos(raiz, reducirMovimiento);
    iniciarBarraMovil(raiz);
  });

  // ─── Fecha de cierre en texto ────────────────────────────────────
  function mostrarFechaFin(raiz, fechaFin) {
    const formato = new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Bogota',
    });
    raiz.querySelectorAll('[data-fecha-fin]').forEach((el) => {
      el.textContent = formato.format(fechaFin);
    });
  }

  // ─── Contador regresivo + estado "finalizada" ────────────────────
  function iniciarContador(raiz, fechaFin) {
    const campos = {
      dias: raiz.querySelector('[data-dias]'),
      horas: raiz.querySelector('[data-horas]'),
      minutos: raiz.querySelector('[data-minutos]'),
      segundos: raiz.querySelector('[data-segundos]'),
      mini: raiz.querySelector('[data-contador-mini]'),
    };
    const dosDigitos = (n) => String(n).padStart(2, '0');
    let intervalo = null;

    const actualizar = () => {
      const restante = fechaFin.getTime() - Date.now();

      if (restante <= 0) {
        clearInterval(intervalo);
        finalizarOferta(raiz);
        return false;
      }

      const total = Math.floor(restante / 1000);
      const dias = Math.floor(total / 86400);
      const horas = dosDigitos(Math.floor((total % 86400) / 3600));

      if (campos.dias) campos.dias.textContent = dias;
      if (campos.horas) campos.horas.textContent = horas;
      if (campos.minutos) campos.minutos.textContent = dosDigitos(Math.floor((total % 3600) / 60));
      if (campos.segundos) campos.segundos.textContent = dosDigitos(total % 60);
      if (campos.mini) campos.mini.textContent = `Termina en ${dias}d ${horas}h`;
      return true;
    };

    if (actualizar()) intervalo = setInterval(actualizar, 1000);
  }

  function finalizarOferta(raiz) {
    raiz.classList.add('campina--finalizada');
    const aviso = raiz.querySelector('[data-finalizada]');
    if (aviso) aviso.hidden = false;
  }

  // ─── ?origen=qr-porteria → se agrega al mensaje de WhatsApp ──────
  function agregarOrigenWhatsApp() {
    const origenCrudo = new URLSearchParams(window.location.search).get('origen') || '';
    // Sanitizar: solo letras, números y guiones, máximo 30 caracteres
    const origen = origenCrudo.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    if (!origen) return;

    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
      const url = new URL(link.href);
      const texto = url.searchParams.get('text') || '';
      link.href = `${url.origin}${url.pathname}?text=${encodeURIComponent(`${texto} [ref: ${origen}]`)}`;
    });
  }

  // ─── Colinas que se mueven a distinta velocidad al hacer scroll ──
  function iniciarParallax(raiz, reducirMovimiento) {
    if (reducirMovimiento) return;

    const capas = [...raiz.querySelectorAll('[data-capa]')];
    if (!capas.length) return;

    let pendiente = false;
    window.addEventListener('scroll', () => {
      if (pendiente) return;
      pendiente = true;
      // requestAnimationFrame: como máximo un cálculo por cuadro de pantalla
      requestAnimationFrame(() => {
        const y = window.scrollY;
        capas.forEach((capa) => {
          capa.style.transform = `translateY(${y * Number(capa.dataset.capa) * -0.35}px)`;
        });
        pendiente = false;
      });
    }, { passive: true });
  }

  // ─── Aparición al hacer scroll + números que cuentan ─────────────
  function iniciarApariciones(raiz, reducirMovimiento) {
    if (!('IntersectionObserver' in window) || reducirMovimiento) return; // todo queda visible con sus valores finales

    raiz.classList.add('campina--animada');

    // Los números arrancan en 0 solo cuando sabemos que podemos animarlos
    const numeros = [...raiz.querySelectorAll('[data-cuenta]')];
    numeros.forEach((el) => pintarNumero(el, 0));

    const mostrar = (el) => {
      el.classList.add('is-visible');
      el.querySelectorAll('[data-cuenta]').forEach(animarNumero);
    };

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        mostrar(entrada.target);
        observador.unobserve(entrada.target); // anima una sola vez
      });
    }, { threshold: 0.15 });

    raiz.querySelectorAll('.reveal').forEach((el) => observador.observe(el));
  }

  function pintarNumero(el, valor) {
    el.textContent = 'miles' in el.dataset ? valor.toLocaleString('es-CO') : valor;
  }

  function animarNumero(el) {
    if (el.dataset.animado) return;
    el.dataset.animado = 'true';

    const final = Number(el.dataset.cuenta);
    const duracion = 1400;
    const inicio = performance.now();

    const paso = (ahora) => {
      const progreso = Math.min(1, (ahora - inicio) / duracion);
      const suavizado = 1 - Math.pow(1 - progreso, 3); // arranca rápido y frena al final
      pintarNumero(el, Math.round(final * suavizado));
      if (progreso < 1) requestAnimationFrame(paso);
    };

    requestAnimationFrame(paso);
  }

  // ─── Línea de pasos que se llena con el scroll ───────────────────
  function iniciarPasos(raiz, reducirMovimiento) {
    const lista = raiz.querySelector('[data-pasos]');
    if (!lista) return;

    const linea = lista.querySelector('.campina-pasos__linea i');
    const pasos = [...lista.querySelectorAll('.campina-paso')];

    const actualizar = () => {
      const caja = lista.getBoundingClientRect();
      const alto = window.innerHeight;
      const progreso = reducirMovimiento
        ? 1
        : Math.min(1, Math.max(0, (alto * 0.75 - caja.top) / (caja.height + alto * 0.25)));

      if (linea) linea.style.setProperty('--p', progreso);
      pasos.forEach((paso, i) => {
        paso.classList.toggle('is-activo', progreso >= i / (pasos.length - 1) - 0.02);
      });
    };

    actualizar();
    if (!reducirMovimiento) window.addEventListener('scroll', actualizar, { passive: true });
  }

  // ─── Barra fija en móvil: aparece cuando el hero sale de pantalla ─
  function iniciarBarraMovil(raiz) {
    const barra = raiz.querySelector('[data-barra-movil]');
    const hero = raiz.querySelector('.campina-hero');
    if (!barra || !hero || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(([entrada]) => {
      barra.classList.toggle('is-visible', !entrada.isIntersecting);
    }).observe(hero);
  }
})();