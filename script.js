let modelo;
const clases = ['sol', 'gato', 'casa', 'flor', 'pez'];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 15;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

let dibujando = false;

canvas.addEventListener('mousedown', () => dibujando = true);
canvas.addEventListener('mouseup', () => {
  dibujando = false;
  ctx.beginPath(); // Reset path para evitar líneas al soltar
});
canvas.addEventListener('mousemove', e => {
  if (!dibujando) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

function limpiar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('resultado').innerText = 'Resultado: ...';
}

async function cargarModelo() {
  try {
    modelo = await tf.loadLayersModel('modelo_js/model.json'); 
    console.log("✅ Modelo cargado correctamente.");
    document.getElementById('btnPredecir').disabled = false;
  } catch (error) {
    console.error("❌ Error cargando el modelo:", error);
  }
}
cargarModelo();

function predecir() {
  if (!modelo) {
    alert("⚠️ El modelo aún no está cargado.");
    return;
  }

  const imagen = tf.browser.fromPixels(canvas, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255.0)
    .reshape([1, 28, 28, 1]);

  const pred = modelo.predict(imagen);
  const index = pred.argMax(1).dataSync()[0];
  const clase = clases[index];
  document.getElementById('resultado').innerText = `Resultado: ${clase}`;
}
