// Referencias DOM
const form = document.getElementById('dedicationForm');
const output = document.getElementById('output');
const linkEl = document.getElementById('link');
const qrContainer = document.getElementById('qr');
const copyBtn = document.getElementById('copyBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const themeToggle = document.getElementById('themeToggle');
const fontToggle = document.getElementById('fontToggle');
const feedbackMsg = document.getElementById('feedbackMsg');
const commentSection = document.getElementById('commentSection');
const commentsList = document.getElementById('commentsList');
const popSound = document.getElementById('pop');

let qrCode = null;
let readingModeOn = false;
let fontSwitched = false;

// Función para generar el enlace
function generarLink(to, message, from) {
  const baseUrl = location.origin + location.pathname;
  const params = new URLSearchParams();
  if (to) params.set('to', to);
  params.set('msg', message);
  if (from) params.set('from', from);
  return `${baseUrl}?${params.toString()}`;
}

// Función para crear QR
function generarQR(url) {
  qrContainer.innerHTML = '';
  qrCode = new QRCode(qrContainer, {
    text: url,
    width: 160,
    height: 160,
    colorDark : "#7c59c9",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
}

// Copiar al portapapeles
copyBtn.addEventListener('click', () => {
  if (linkEl.href) {
    navigator.clipboard.writeText(linkEl.href).then(() => {
      feedbackMsg.textContent = '¡Enlace copiado al portapapeles!';
      popSound.play();
      setTimeout(() => feedbackMsg.textContent = '', 3000);
    });
  }
});

// Compartir por WhatsApp
whatsappBtn.addEventListener('click', () => {
  if (linkEl.href) {
    const urlEncoded = encodeURIComponent(linkEl.href);
    whatsappBtn.href = `https://wa.me/?text=${urlEncoded}`;
  }
});

// Cambiar tema oscuro/claro
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Cambiar fuente
fontToggle.addEventListener('click', () => {
  fontSwitched = !fontSwitched;
  if (fontSwitched) {
    output.style.fontFamily = "'Georgia', serif";
  } else {
    output.style.fontFamily = "'Poppins', sans-serif";
  }
});

// Al enviar el formulario
form.addEventListener('submit', e => {
  e.preventDefault();
  const to = form.to.value.trim();
  const msg = form.message.value.trim();
  const from = form.from.value.trim();

  if (!msg) {
    feedbackMsg.textContent = 'Por favor, escribe un mensaje.';
    return;
  }

  feedbackMsg.textContent = '';

  const url = generarLink(to, msg, from);

  linkEl.href = url;
  linkEl.textContent = url;

  generarQR(url);

  output.style.display = 'block';

  // Mostrar sección comentarios solo si hay para mostrar (ejemplo: podrías poblarla)
  // Por ahora siempre la mostramos
  commentSection.style.display = 'block';

  // Modo lectura: mostrar mensaje formateado con fuente legible
  mostrarModoLectura(to, msg, from);

  popSound.play();
});

// Función para mostrar modo lectura
function mostrarModoLectura(to, msg, from) {
  let texto = '';
  if (to) texto += `Para: ${to}\n\n`;
  texto += msg;
  if (from) texto += `\n\n- ${from}`;

  // Crear un div o actualizar el existente con clase reading-mode
  let readingDiv = document.querySelector('.reading-mode');
  if (!readingDiv) {
    readingDiv = document.createElement('div');
    readingDiv.className = 'reading-mode';
    output.appendChild(readingDiv);
  }
  readingDiv.textContent = texto;
}

// Ejemplo: agregar comentarios (podrías cargar desde base datos o localStorage)
function cargarComentarios() {
  const comentarios = [
    {user: 'Ana', text: '¡Me encantó el diseño! 💜'},
    {user: 'Luis', text: 'Muy útil, gracias por compartir.'},
    {user: 'Marta', text: 'El modo lectura es lo mejor 👌'}
  ];
  commentsList.innerHTML = '';
  comentarios.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.textContent = `${c.user}: ${c.text}`;
    commentsList.appendChild(div);
  });
}

cargarComentarios();
