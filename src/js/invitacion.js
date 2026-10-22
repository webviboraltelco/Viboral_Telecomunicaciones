// archivo: src/js/invitacion.js
//
// Personaliza la invitación (?nombre=...) y arma los links de WhatsApp.
// Va envuelto en una función que se ejecuta sola (IIFE) y se detiene si la
// página no tiene .inv: así es seguro aunque Gulp lo una en bundle.min.js
// y se cargue en todas las páginas del sitio.
(() => {
  'use strict';

  const raiz = document.querySelector('.inv');
  if (!raiz) return;

  /**
   * Configuración del evento: el ÚNICO lugar que debes editar.
   * El número es público (va en un link de WhatsApp), no es un secreto.
   */
  const CONFIG = {
    telefono: '573207882028',               // Solo dígitos, con indicativo 57, sin + ni espacios
    evento: 'Encuentro de Delegados de Viboral Telecomunicaciones',
    maxLargoNombre: 60,
  };

  /**
   * Lee ?nombre=... de la URL y lo limpia: solo letras (con tildes/ñ),
   * espacios, puntos, guiones y apóstrofes.
   */
  function obtenerNombreDesdeUrl() {
    const params = new URLSearchParams(window.location.search);
    const nombre = params.get('nombre') || '';

    return nombre
      .replace(/[^\p{L}\s.'-]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, CONFIG.maxLargoNombre);
  }

  /** Texto que llegará por WhatsApp según la respuesta. */
  function construirMensaje(tipo, nombre) {
    const respuestas = {
      si: `confirmo mi asistencia al ${CONFIG.evento}. ¡Gracias por la invitación!`,
      no: `lamento informar que no podré asistir al ${CONFIG.evento}. Gracias por la invitación.`,
    };

    const respuesta = respuestas[tipo] || respuestas.si;

    // Con nombre en la URL: "Hola, soy María López, confirmo mi asistencia..."
    if (nombre) {
      return `Hola, soy ${nombre}, ${respuesta}`;
    }

    // Sin nombre: mismo texto del HTML, con el campo para que lo escriba
    return `Hola, ${respuesta}\n\nNombre completo: `;
  }

  function construirEnlaceWhatsApp(mensaje) {
    return `https://wa.me/${CONFIG.telefono}?text=${encodeURIComponent(mensaje)}`;
  }

  /** Cambia "delegado(a)" por el nombre. textContent evita inyección de HTML. */
  function personalizarSaludo(nombre) {
    if (!nombre) return;

    raiz.querySelectorAll('[data-nombre]').forEach((elemento) => {
      elemento.textContent = nombre;
    });
  }

  function configurarBotonesWhatsApp(nombre) {
    raiz.querySelectorAll('[data-wa]').forEach((boton) => {
      const mensaje = construirMensaje(boton.dataset.wa, nombre);
      boton.href = construirEnlaceWhatsApp(mensaje);
    });
  }

  const nombre = obtenerNombreDesdeUrl();
  personalizarSaludo(nombre);
  configurarBotonesWhatsApp(nombre);
})();