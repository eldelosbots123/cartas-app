// --- Variables y referencias ---
const nombreInput = document.getElementById('nombreUsuario');
const msgCambioNombre = document.getElementById('msg-cambio-nombre');
const mensajeInput = document.getElementById('mensaje');
const destinatarioInput = document.getElementById('destinatario');
const enviarBtn = document.getElementById('enviarBtn');
const confirmacion = document.getElementById('confirmacion');
const misCartitasDiv = document.getElementById('misCartitas');
const buzonDiv = document.getElementById('buzonCartitas');
const sobreAnimacion = document.getElementById('sobreAnimacion');
const listaConectados = document.getElementById('listaConectados');

// --- Storage Keys ---
const STORAGE_USUARIO = 'cartas_usuario';
const STORAGE_CARTAS = 'cartas_enviadas';
const STORAGE_BUZON = 'cartas_buzon';
const STORAGE_NICK_CHANGE = 'cartas_nick_change';
const STORAGE_CORAZONES = 'cartas_corazones';

// --- Estado ---
let usuario = null;
let cartasEnviadas = [];
let cartasBuzon = [];
let corazonesDados = {};
let usuariosConectados = [];  // VACÍO para que sea real

// --- Helpers ---
function generarID() {
  return 'carta_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function cargarJSON(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function guardarJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function puedeCambiarNombre() {
  const lastChangeStr = localStorage.getItem(STORAGE_NICK_CHANGE);
  if (!lastChangeStr) return true;
  const diffDias = (new Date() - new Date(lastChangeStr)) / (1000 * 60 * 60 * 24);
  return diffDias >= 7;
}

function guardarFechaCambioNombre() {
  localStorage.setItem(STORAGE_NICK_CHANGE, new Date().toISOString());
}

function validarInputs() {
  enviarBtn.disabled = !(mensajeInput.value.trim().length > 3 && nombreInput.value.trim().length > 0);
}

function mostrarHistorial() {
  misCartitasDiv.innerHTML = cartasEnviadas.length === 0 ? '' : cartasEnviadas.map(carta =>
    `<div class="cartita">
      <p>${carta.texto}</p>
      <div class="footer"><span>ID: ${carta.id}</span><span>Para: ${carta.destinatario || 'Todos'}</span></div>
    </div>`
  ).join('');
}

function mostrarBuzon() {
  buzonDiv.innerHTML = '';
  cartasBuzon.forEach(carta => {
    const div = document.createElement('div');
    div.className = 'cartita';
    div.innerHTML = `
      <p>${carta.texto}</p>
      <div class="footer">
        <span>De: ${carta.autor}</span>
        <button class="corazon" data-id="${carta.id}" title="Dale corazón ❤️">${corazonesDados[carta.id] ? '❤️' : '♡'}</button>
      </div>
    `;
    buzonDiv.appendChild(div);
  });

  buzonDiv.querySelectorAll('.corazon').forEach(btn => {
    const cartaId = btn.getAttribute('data-id');
    if (corazonesDados[cartaId]) {
      btn.disabled = true;
      btn.style.cursor = 'default';
    }
    btn.onclick = () => {
      if (!corazonesDados[cartaId]) {
        corazonesDados[cartaId] = true;
        guardarJSON(STORAGE_CORAZONES, corazonesDados);
        mostrarBuzon();
      }
    };
  });
}

function mostrarUsuarios() {
  listaConectados.innerHTML = usuariosConectados.length === 0
    ? '<li>No hay usuarios conectados</li>'
    : usuariosConectados.map(u => `<li>${u}</li>`).join('');
}

// --- Eventos ---
sobreAnimacion.addEventListener('click', () => {
  sobreAnimacion.classList.toggle('abierto');
});

nombreInput.addEventListener('input', () => {
  if (!puedeCambiarNombre()) {
    msgCambioNombre.textContent = 'Solo podés cambiar tu nombre una vez cada 7 días.';
    if (usuario) nombreInput.value = usuario.nick;
  } else {
    msgCambioNombre.textContent = '';
  }
  validarInputs();
});

nombreInput.addEventListener('blur', () => {
  const nuevoNick = nombreInput.value.trim();
  if (nuevoNick.length === 0) {
    msgCambioNombre.textContent = 'El nombre no puede estar vacío.';
    if (usuario) nombreInput.value = usuario.nick;
    return;
  }
  if (usuario && nuevoNick === usuario.nick) return;
  if (!puedeCambiarNombre()) {
    msgCambioNombre.textContent = 'Solo podés cambiar tu nombre una vez cada 7 días.';
    if (usuario) nombreInput.value = usuario.nick;
    return;
  }
  usuario.nick = nuevoNick;
  guardarJSON(STORAGE_USUARIO, usuario);
  guardarFechaCambioNombre();
  msgCambioNombre.textContent = 'Nombre guardado. Podrás cambiarlo en 7 días.';
  mostrarUsuarios();
  validarInputs();
});

mensajeInput.addEventListener('input', validarInputs);

enviarBtn.addEventListener('click', () => {
  const texto = mensajeInput.value.trim();
  const destinatarioRaw = destinatarioInput.value.trim();
  const destinatario = destinatarioRaw.startsWith('@') ? destinatarioRaw.substring(1) : '';

  if (!usuario) {
    confirmacion.textContent = '';
    return;
  }
  if (texto.length < 3) {
    confirmacion.textContent = '';
    return;
  }

  const carta = {
    id: generarID(),
    texto,
    autor: usuario.nick,
    destinatario: destinatario || '',
    fecha: new Date().toISOString(),
  };

  cartasEnviadas.push(carta);
  guardarJSON(STORAGE_CARTAS, cartasEnviadas);
  mostrarHistorial();

  if (destinatario && destinatario !== usuario.nick) {
    confirmacion.textContent = '';
  } else {
    cartasBuzon.push(carta);
    guardarJSON(STORAGE_BUZON, cartasBuzon);
    mostrarBuzon();
    confirmacion.textContent = '';
  }

  mensajeInput.value = '';
  destinatarioInput.value = '';
  enviarBtn.disabled = true;
});

// --- Inicialización ---
function init() {
  usuario = cargarJSON(STORAGE_USUARIO);
  cartasEnviadas = cargarJSON(STORAGE_CARTAS) || [];
  cartasBuzon = cargarJSON(STORAGE_BUZON) || [];
  corazonesDados = cargarJSON(STORAGE_CORAZONES) || {};

  if (usuario) nombreInput.value = usuario.nick;

  mostrarHistorial();
  mostrarBuzon();
  mostrarUsuarios();
  validarInputs();

  msgCambioNombre.textContent = puedeCambiarNombre() ? '' : 'Solo podés cambiar tu nombre una vez cada 7 días.';
}

init();
