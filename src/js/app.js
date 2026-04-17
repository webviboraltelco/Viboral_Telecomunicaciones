document.addEventListener("DOMContentLoaded", function () {
  eventListeners();
  darkMode();
  headerScroll();
});

// ─── Dark Mode ────────────────────────────────────────────────────
function darkMode() {
  const boton = document.querySelector(".dark-mode-boton");
  if (!boton) return;

  // Recupera preferencia guardada
  const guardado = localStorage.getItem('darkMode');
  if (guardado === 'activo') {
    document.body.classList.add('dark-mode');
  }

  boton.addEventListener("click", function () {
    const activo = document.body.classList.toggle("dark-mode");
    // Guarda preferencia
    localStorage.setItem('darkMode', activo ? 'activo' : 'inactivo');
  });
}

// ─── Menú responsive ──────────────────────────────────────────────
function eventListeners() {
  const mobileMenu = document.getElementById("mobileMenu");
  const navegacion = document.getElementById("navegacion");

  if (!mobileMenu || !navegacion) return;

  mobileMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    const abierto = navegacion.classList.toggle("mostrar");
    mobileMenu.classList.toggle("activo", abierto);
    mobileMenu.setAttribute("aria-expanded", abierto);
  });

  // Cierra al hacer clic fuera
  document.addEventListener("click", (e) => {
    const dentroHeader = e.target.closest(".header");
    if (!dentroHeader && navegacion.classList.contains("mostrar")) {
      navegacion.classList.remove("mostrar");
      mobileMenu.classList.remove("activo");
      mobileMenu.setAttribute("aria-expanded", false);
    }
  });

  // Cierra al hacer clic en un link del menú (móvil)
  navegacion.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        navegacion.classList.remove("mostrar");
        mobileMenu.classList.remove("activo");
        mobileMenu.setAttribute("aria-expanded", false);
      }
    });
  });
}

// ─── Header cambia al hacer scroll ───────────────────────────────
function headerScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  // Solo aplica en páginas sin imagen de fondo (no .inicio)
  if (header.classList.contains("inicio")) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });
}



// ─── Slider de Testimonios ────────────────────────────────────────
(function () {
  const track     = document.getElementById('testimoniosTrack');
  const btnPrev   = document.getElementById('testimonioPrev');
  const btnNext   = document.getElementById('testimonioNext');
  const dots      = document.querySelectorAll('.testimonios-dots .dot');
  const controles = document.querySelector('.testimonios-controles');

  if (!track || !btnPrev || !btnNext) return;

  const cards = track.querySelectorAll('.testimonio-card');
  const total = cards.length;
  let indice   = 0;
  let intervalo = null;

  function visibles() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768)  return 2;
    return 1;
  }

  function maxIndice() {
    return Math.max(0, total - visibles());
  }

  function verificarControles() {
    const hayQueNavegar = visibles() < total;
    if (controles) {
      controles.style.visibility = hayQueNavegar ? 'visible' : 'hidden';
    }
    return hayQueNavegar;
  }

  function irA(nuevoIndice) {
    verificarControles();

    // Loop circular
    if (nuevoIndice > maxIndice())  indice = 0;
    else if (nuevoIndice < 0)       indice = maxIndice();
    else                            indice = nuevoIndice;

    // ✅ Traducción en porcentaje — no depende de offsetWidth
    // Cada card ocupa (100 / visibles())% del slider
    // → mover 1 card = mover (100 / visibles())% del track
    const porcentajePorCard = 100 / visibles();
    track.style.transform = `translateX(-${indice * porcentajePorCard}%)`;

    // Actualiza dots
    dots.forEach((d, i) => d.classList.toggle('activo', i === indice));

    btnPrev.disabled = false;
    btnNext.disabled = false;
  }

  function iniciarAutoplay() {
    if (!verificarControles()) return;
    intervalo = setInterval(() => irA(indice + 1), 5000);
  }

  function resetAutoplay() {
    clearInterval(intervalo);
    iniciarAutoplay();
  }

  btnNext.addEventListener('click', () => { irA(indice + 1); resetAutoplay(); });
  btnPrev.addEventListener('click', () => { irA(indice - 1); resetAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      irA(parseInt(dot.dataset.index));
      resetAutoplay();
    });
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    diff > 0 ? irA(indice + 1) : irA(indice - 1);
    resetAutoplay();
  });

  window.addEventListener('resize', () => { irA(0); resetAutoplay(); });

  track.addEventListener('mouseenter', () => clearInterval(intervalo));
  track.addEventListener('mouseleave', iniciarAutoplay);

  irA(0);
  iniciarAutoplay();
})();

// ─── Filtro de Planes ─────────────────────────────────────────────
(function () {
  const botones = document.querySelectorAll('.filtro-btn');
  const cards   = document.querySelectorAll('.plan-card');

  if (!botones.length || !cards.length) return;

  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const filtro = btn.dataset.filtro;

      // Actualiza botón activo
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      // Filtra las cards con animación
      cards.forEach(card => {
        const categoria = card.dataset.categoria;
        const mostrar   = filtro === 'todos' || categoria === filtro;

        card.classList.remove('visible', 'oculto');

        if (mostrar) {
          card.classList.remove('oculto');
          // pequeño delay para que la animación se vea
          requestAnimationFrame(() => card.classList.add('visible'));
        } else {
          card.classList.add('oculto');
        }
      });
    });
  });
})();

// ─── Grilla de Horarios ───────────────────────────────────────────
(function () {
  const tbody   = document.getElementById('tbodyHorarios');
  const theadR  = document.getElementById('theadRow');
  const buscador = document.getElementById('buscadorHorario');
  const sinRes  = document.getElementById('sinResultados');

  if (!tbody) return;

  const diasNombres = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const horarios = [
    ['07:00 AM','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO'],
    ['07:30 AM','Tom Sawyer','C. Hnos. Grimm','El Mago de Oz','Tom Sawyer','C. Hnos. Grimm','El Mago de Oz','El Libro de la Selva'],
    ['08:00 AM','Batman','Los Pitufos','Batman','Zenki','Batman','Los Pitufos','EUCARISTIA'],
    ['08:30 AM','Franja Documental','El Libro de la Selva','Especial Retro','Happy English','Especial Retro','Zenki','EUCARISTIA'],
    ['09:00 AM','Especial Retro','Especial Retro','Franja Documental','Franja Documental','Testigo Directo','Mañana en Vibo','De la mano con Jesús'],
    ['09:30 AM','Especial Retro','Manos Creativas','Franja Documental','Franja Documental','Hogar en Forma','Mañana en Vibo','Mañana en Vibo'],
    ['10:00 AM','U.HIT E.M.P.','San Alejo Musical','Los Clásicos','Mañana en Vibo','Salud y Movimiento','Mañana en Vibo','Mañana en Vibo'],
    ['10:30 AM','Happy English','San Alejo Musical','Los Clásicos','Mañana en Vibo','U.HIT AR','Mañana en Vibo','Mañana en Vibo'],
    ['11:00 AM','De la mano con Jesús','San Alejo Musical','Manos Creativas','Mañana en Vibo','U.HIT EMP','Happy English','Mañana en Vibo'],
    ['11:30 AM','U.HIT GTV','San Alejo Musical','Desafío Agropecuario','Mañana en Vibo','Franja Documental','Pizarra','Happy English'],
    ['12:00 PM','Salud y Movimiento','U.HIT U.HIT','Testigo Directo','Primer Plano','Franja Documental','Pizarra','EUCARISTIA'],
    ['12:30 PM','U.HIT U.HIT','Pop Star','U.HIT HDP','Primer Plano','A Volar','Antesala','EUCARISTIA'],
    ['01:00 PM','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO'],
    ['01:30 PM','NOTICIERO','Especiales Viboral','Especiales Viboral','Especiales Viboral','Especiales Viboral','Especiales Viboral','NOTICIERO'],
    ['02:00 PM','Los Clásicos','U.HIT E.M.P.','U.HIT RDS','U.HIT RDS','Creciendo en la Fe','Pop Star','Los Clásicos'],
    ['02:30 PM','Los Clásicos','Especial Retro','U.HIT GTV','Testigo Directo Archivo','U.HIT GUASCA TV','Franja Documental','Los Clásicos'],
    ['03:00 PM','U.HIT AR','U.HIT HDP','Especial Retro','Especial Retro','SAN ALEJO','Franja Documental','Testigo Directo FULL'],
    ['03:30 PM','U.HIT CALF','La Tocata y la Tocadera','Multiritmos','Retratos de mi Tierra','SAN ALEJO','Manos Creativas','Testigo Directo FULL'],
    ['04:00 PM','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','SAN ALEJO','NOTICIERO','NOTICIERO'],
    ['04:30 PM','NOTICIERO','Especiales Viboral','Especiales Viboral','Especiales Viboral','SAN ALEJO','Especiales Viboral','NOTICIERO'],
    ['05:00 PM','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO','ROSARIO'],
    ['05:30 PM','MISA','MISA','MISA','MISA','MISA','Creciendo en la Fe','EUCARISTIA'],
    ['06:00 PM','Especiales Viboral','Especiales Viboral','Especiales Viboral','Especiales Viboral','Especiales Viboral','San Alejo Musical','EUCARISTIA'],
    ['06:30 PM','Multiritmos','A Volar','De la mano con Jesús','La Tocata y la Tocadera','Los Clásicos','San Alejo Musical','Desafío Agropecuario'],
    ['07:00 PM','Franja Documental','Hogar en Forma','U.HIT TDLR','ALCALDIA','Los Clásicos','San Alejo Musical','Retratos de mi Tierra'],
    ['07:30 PM','Retratos de mi Tierra','Creciendo en la Fe','Retratos de mi Tierra','ALCALDIA','Antesala','San Alejo Musical','ALCALDIA'],
    ['08:00 PM','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO'],
    ['08:30 PM','Testigo Directo','Testigo Directo','Testigo Directo','Testigo Directo','Testigo Directo','NOTICIERO','NOTICIERO'],
    ['09:00 PM','Desafío Agropecuario','Primer Plano','Pizarra','La Tocata y la Tocadera','San Alejo Musical','Especial Retro','Retros Viboral'],
    ['09:30 PM','Antesala','Primer Plano','Pizarra','Pop Star','San Alejo Musical','Especial Retro','Retros Viboral'],
    ['10:00 PM','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','San Alejo Musical','NOTICIERO','NOTICIERO'],
    ['10:30 PM','Especial Retro','Pop Star','Franja Documental','Desafío Agropecuario','San Alejo Musical','NOTICIERO','NOTICIERO'],
    ['11:00 PM','Especial Retro','Los Clásicos','Franja Documental','Primer Plano','NOTICIERO','La Tocata y la Tocadera','Pizarra'],
    ['11:30 PM','U.HIT RDS','Los Clásicos','Salud y Movimiento','Primer Plano','Franja Documental','Primer Plano','Pizarra'],
    ['12:00 AM','U.HIT E.M.P.','La Tocata y la Tocadera','De la mano con Jesús','Especial Retro','Franja Documental','Primer Plano','Desafío Agropecuario'],
    ['12:30 AM','Pop Star','U.HIT HDP','Desafío Agropecuario','Especial Retro','U.HIT GTV','Pizarra','Franja Documental'],
    ['03:30 AM','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO','NOTICIERO'],
    ['04:00 AM','HIMNOS','HIMNOS','HIMNOS','HIMNOS','HIMNOS','HIMNOS','HIMNOS'],
  ];

  function categoria(nombre) {
    const n = nombre.toUpperCase();
    if (n.includes('NOTICIERO'))                                       return 'noticiero';
    if (n.includes('ROSARIO')||n.includes('MISA')||n.includes('EUCARISTIA')||n.includes('HIMNO')) return 'rosario';
    if (n.includes('SAN ALEJO')||n.includes('MUSICAL')||n.includes('TOCATA')||n.includes('MULTIRITMO')||n.includes('POP STAR')||n.includes('CLÁSICO')) return 'musical';
    if (n.includes('TOM')||n.includes('BATMAN')||n.includes('PITUFO')||n.includes('ZENKI')||n.includes('MAGO')||n.includes('LIBRO')||n.includes('GRIMM')) return 'infantil';
    if (n.includes('DOCUMENTAL')||n.includes('RETRATO')||n.includes('DESAFÍO')||n.includes('TESTIGO')||n.includes('PIZARRA')||n.includes('ANTESALA')||n.includes('PRIMER PLANO')||n.includes('ESPECIAL')) return 'cultural';
    if (n.includes('FE')||n.includes('JESÚS')||n.includes('CRECIENDO')||n.includes('VOLAR')||n.includes('SALUD')||n.includes('HOGAR')||n.includes('HAPPY')) return 'espiritual';
    if (n.includes('U.HIT')||n.includes('UHIT'))                      return 'uhit';
    return 'variedades';
  }

  let diaActivo = 'todos';
  let busqueda  = '';

  function actualizarCabecera() {
    const cols = diaActivo === 'todos'
      ? ['Hora', ...diasNombres]
      : ['Hora', diasNombres[parseInt(diaActivo)]];

    theadR.innerHTML = '';
    cols.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      theadR.appendChild(th);
    });
  }

  function renderTabla() {
    actualizarCabecera();
    tbody.innerHTML = '';
    let visibles = 0;

    horarios.forEach(fila => {
      const hora = fila[0];
      const celdas = diaActivo === 'todos'
        ? fila
        : [hora, fila[parseInt(diaActivo) + 1]];

      const coincide = busqueda === '' ||
        celdas.some(c => c.toLowerCase().includes(busqueda.toLowerCase()));

      if (!coincide) return;
      visibles++;

      const tr = document.createElement('tr');
      celdas.forEach((val, i) => {
        const td = document.createElement('td');
        if (i === 0) {
          td.textContent = val;
        } else {
          const span = document.createElement('span');
          span.className = `prog-pill prog-${categoria(val)}`;
          span.textContent = val;
          td.appendChild(span);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    if (sinRes) sinRes.style.display = visibles === 0 ? 'block' : 'none';
  }

  // Filtros de día
  document.querySelectorAll('.dia-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dia-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      diaActivo = btn.dataset.dia;
      renderTabla();
    });
  });

  // Buscador
  if (buscador) {
    buscador.addEventListener('input', e => {
      busqueda = e.target.value;
      renderTabla();
    });
  }

  renderTabla();
})();


// ─── Formulario PQRS (EmailJS) ────────────────────────────────────
(function () {
  const formulario = document.getElementById('formulario-pqrs');
  if (!formulario) return;

  if (typeof emailjs === 'undefined') {
    console.warn('EmailJS no está cargado');
    return;
  }

  // ✅ Reemplazá estos tres valores con los tuyos de emailjs.com
  const PUBLIC_KEY  = '_8EyGv2IKkK3p90L9';
  const SERVICE_ID  = 'service_n9bwx8p';
  const TEMPLATE_ID = 'template_mtmfj4r';

  emailjs.init({ publicKey: PUBLIC_KEY });

  const btnEnviar = document.getElementById('btnEnviar');

  // ─── Validación de campos ─────────────────────────────────────
  function validarCampo(input) {
    const grupo = input.closest('.formulario__grupo');
    const error = grupo.querySelector('.campo-error');

    if (!input.value.trim()) {
      input.classList.add('invalido');
      if (!error) {
        const msg = document.createElement('span');
        msg.className = 'campo-error';
        msg.textContent = 'Este campo es obligatorio';
        grupo.appendChild(msg);
      }
      return false;
    }

    if (input.type === 'email') {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!emailValido) {
        input.classList.add('invalido');
        if (!error) {
          const msg = document.createElement('span');
          msg.className = 'campo-error';
          msg.textContent = 'Ingresá un correo válido';
          grupo.appendChild(msg);
        }
        return false;
      }
    }

    // Campo válido — limpia el error
    input.classList.remove('invalido');
    if (error) error.remove();
    return true;
  }

  function validarFormulario() {
    const campos = formulario.querySelectorAll('input[required], select[required], textarea[required]');
    let valido = true;
    campos.forEach(campo => {
      if (!validarCampo(campo)) valido = false;
    });
    return valido;
  }

  // Validación en tiempo real al salir de cada campo
  formulario.querySelectorAll('input, select, textarea').forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => {
      if (campo.classList.contains('invalido')) validarCampo(campo);
    });
  });

  // ─── Envío ────────────────────────────────────────────────────
  formulario.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validarFormulario()) {
      mostrarAlerta('Por favor corregí los campos marcados en rojo.', 'error');
      return;
    }

    // Estado de carga
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const params = {
      nombre:    formulario.querySelector('#nombre').value.trim(),
      cedula:    formulario.querySelector('#cedula').value.trim(),
      email:     formulario.querySelector('#email').value.trim(),
      telefono:  formulario.querySelector('#telefono').value.trim(),
      tipo_pqrs: formulario.querySelector('#servicio').value,
      mensaje:   formulario.querySelector('#mensaje').value.trim(),
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);

      mostrarAlerta('✅ Tu solicitud fue enviada exitosamente. Te contactaremos pronto.', 'exito');
      formulario.reset();

      // Limpia clases de validación
      formulario.querySelectorAll('.invalido').forEach(el => el.classList.remove('invalido'));
      formulario.querySelectorAll('.campo-error').forEach(el => el.remove());

    } catch (error) {
      console.error('Error EmailJS:', error);
      mostrarAlerta('❌ No se pudo enviar. Verificá tu conexión e intentá de nuevo.', 'error');

    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar solicitud';
    }
  });

  // ─── Alerta visual ────────────────────────────────────────────
  function mostrarAlerta(mensaje, tipo) {
    const existente = document.querySelector('.alerta-form');
    if (existente) existente.remove();

    const alerta = document.createElement('div');
    alerta.className = `alerta-form alerta-${tipo}`;
    alerta.innerHTML = mensaje;

    // La inserta después del botón de envío
    btnEnviar.insertAdjacentElement('afterend', alerta);

    // Scroll suave hacia la alerta
    alerta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Se auto-elimina a los 6 segundos
    setTimeout(() => {
      alerta.style.opacity = '0';
      alerta.style.transition = 'opacity .4s ease';
      setTimeout(() => alerta.remove(), 400);
    }, 6000);
  }

})();