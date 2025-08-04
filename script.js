// --- Variables y referencias ---
const nombreInput = document.getElementById('nombreUsuario');
const msgCambioNombre = document.getElementById('msg-cambio-nombre');
const mensajeInput = document.getElementById('mensaje');
const destinatarioInput = document.getElementById('destinatario');
const enviarBtn = document.getElementById('enviarBtn');
const confirmacion = document.getElementById('confirmacion');
const misCartitasDiv = document.getElementById('misCartitas');
const buzonCartitasDiv = document.getElementById('buzonCartitas');
const listaConectados = document.getElementById('listaConectados');
const sobreAnimacion = document.getElementById('sobreAnimacion');

let nombreUsuario = localStorage.getItem('nombreUsuario') || '';
let ultimoCambioNombre = localStorage.getItem('ultimoCambioNombre') || '0';

let cartasEnviadas = JSON.parse(localStorage.getItem('cartasEnviadas')) || [];
let cartasRecibidas = JSON.parse(localStorage.getItem('cartasRecibidas')) || [];
let usuariosConectados = ['@ConejoOlimpico', '@MatematicoMisterioso', '@GeometriaFan']; // simulación

// --- Funciones ---

// Mostrar usuarios conectados
function mostrarUsuariosConectados() {
  listaConectados.innerHTML = '';
  usuariosConectados.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    listaConectados.appendChild(li);
  });
}

// Guardar nombre usuario y validar cambio cada 7 días
function validarYGuardarNombre() {
  const ahora = Date.now();
  const limiteCambio = parseInt(ultimoCambioNombre) + 7 * 24 * 3600 * 1000;

  if (nombreInput.value.trim() === '') {
    msgCambioNombre.textContent = 'El nombre no puede estar vacío.';
    enviarBtn.disabled = true;
    return false;
  }
  if (nombreInput.value.trim().length > 20) {
    msgCambioNombre.textContent = 'Nombre demasiado largo.';
    enviarBtn.disabled = true;
    return false;
  }

  if (ahora < limiteCambio && nombreInput.value.trim() !== nombreUsuario) {
    const diasRestantes = Math.ceil((limiteCambio - ahora) / (24 * 3600 * 1000));
    msgCambioNombre.textContent = `Puedes cambiar tu nombre en ${diasRestantes} día(s).`;
    enviarBtn.disabled = true;
    return false;
  }

  // Si todo bien, guardar y actualizar
  nombreUsuario = nombreInput.value.trim();
  localStorage.setItem('nombreUsuario', nombreUsuario);
  localStorage.setItem('ultimoCambioNombre', ahora.toString());
  ultimoCambioNombre = ahora.toString();
  msgCambioNombre.textContent = 'Nombre guardado con éxito!';
  enviarBtn.disabled = false;
  mostrarMisCartitas();
  mostrarCartasBuzon();
  return true;
}

// Mostrar cartas enviadas
function mostrarMisCartitas() {
  misCartitasDiv.innerHTML = '';
  if (cartasEnviadas.length === 0) {
    misCartitasDiv.innerHTML = '<p>No enviaste cartas aún.</p>';
    return;
  }
  cartasEnviadas.forEach((carta, idx) => {
    const div = document.createElement('div');
    div.className = 'cartita';
    div.innerHTML = `
      <div>${carta.texto}</div>
      <div class="footer">
        <small>Para: ${carta.destinatario}</small>
        <small>❤️ ${carta.likes || 0}</small>
      </div>
    `;
    misCartitasDiv.appendChild(div);
  });
}

// Mostrar cartas recibidas en el buzón
function mostrarCartasBuzon() {
  buzonCartitasDiv.innerHTML = '';
  if (cartasRecibidas.length === 0) {
    buzonCartitasDiv.innerHTML = '<p>No hay cartas en tu buzón.</p>';
    return;
  }
  cartasRecibidas.forEach((carta, idx) => {
    const div = document.createElement('div');
    div.className = 'cartita';
    div.innerHTML = `
      <div>${carta.texto}</div>
      <div class="footer">
        <small>De: ${carta.remitente}</small>
        <small>❤️ ${carta.likes || 0}</small>
        <button class="corazon" aria-label="Me gusta carta">❤️</button>
      </div>
    `;
    buzonCartitasDiv.appendChild(div);

    // Listener para like
    const likeBtn = div.querySelector('.corazon');
    likeBtn.addEventListener('click', () => {
      carta.likes = (carta.likes || 0) + 1;
      mostrarCartasBuzon();
      // Aquí podrías agregar persistencia
    });
  });
}

// Validar inputs para habilitar botón enviar
function validarInputs() {
  const textoValido = mensajeInput.value.trim().length > 0;
  const destinatarioValido = destinatarioInput.value.trim().length > 0;
  enviarBtn.disabled = !(textoValido && destinatarioValido && nombreUsuario.length > 0);
}

// Enviar carta
function enviarCarta() {
  if (!validarYGuardarNombre()) return;

  const texto = mensajeInput.value.trim();
  const destinatario = destinatarioInput.value.trim();

  // Simular envío: agregar a cartas enviadas y cartas recibidas
  const carta = {
    texto,
    destinatario,
    remitente: nombreUsuario,
    likes: 0,
    fecha: new Date().toISOString()
  };

  cartasEnviadas.push(carta);
  // Simulamos que el destinatario recibe la carta (solo si destinatario es distinto del remitente)
  if (destinatario !== nombreUsuario) cartasRecibidas.push(carta);

  // Guardar en localStorage
  localStorage.setItem('cartasEnviadas', JSON.stringify(cartasEnviadas));
  localStorage.setItem('cartasRecibidas', JSON.stringify(cartasRecibidas));

  mensajeInput.value = '';
  destinatarioInput.value = '';
  enviarBtn.disabled = true;
  confirmacion.textContent = 'Carta enviada con éxito 🥳';

  mostrarMisCartitas();
  mostrarCartasBuzon();

  // Animación sobre
  animarSobre();
}

// Animación del sobre
function animarSobre() {
  sobreAnimacion.classList.add('abierto');
  setTimeout(() => {
    sobreAnimacion.classList.remove('abierto');
  }, 1200);
}

// --- Eventos ---

// Cargar datos iniciales
window.addEventListener('load', () => {
  nombreInput.value = nombreUsuario;
  validarYGuardarNombre();
  mostrarUsuariosConectados();
  mostrarMisCartitas();
  mostrarCartasBuzon();
  validarInputs();
});

// Validar inputs y habilitar botón
mensajeInput.addEventListener('input', validarInputs);
destinatarioInput.addEventListener('input', validarInputs);
nombreInput.addEventListener('change', validarYGuardarNombre);

// Enviar carta al click
enviarBtn.addEventListener('click', enviarCarta);

// Animar sobre al click
sobreAnimacion.addEventListener('click', () => {
  animarSobre();
});

