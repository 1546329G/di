let modelo;
const clases = ['sol', 'gato', 'casa', 'flor', 'pez'];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 15;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

let dibujando = false;

// Event Listeners para el dibujo
canvas.addEventListener('mousedown', () => {
    dibujando = true;
    ctx.beginPath(); // Inicia un nuevo trazo
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top); // Mueve el punto de inicio
});

canvas.addEventListener('mouseup', () => {
    dibujando = false;
});

canvas.addEventListener('mousemove', e => {
    if (!dibujando) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
});

// Función para limpiar el lienzo
function limpiar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('resultado').innerText = 'Resultado: ...';
    console.log("Canvas limpiado.");
    alert("Canvas limpiado. Puedes dibujar de nuevo.");
}

// Función asíncrona para cargar el modelo
async function cargarModelo() {
    console.log("Intentando cargar el modelo...");
    alert("Intentando cargar el modelo. Espera un momento...");

    // URL donde esperamos encontrar el modelo
    const modelUrl = 'modelo_js/model.json'; // Asegúrate que esta ruta es CORRECTA

    try {
        // Primero, intentamos verificar si el archivo JSON es accesible
        const response = await fetch(modelUrl);
        if (!response.ok) {
            const errorText = `Error HTTP: ${response.status} - ${response.statusText}. Esto significa que el archivo model.json NO SE ENCUENTRA o hay un problema en el servidor web.`;
            console.error("❌ Error de red al acceder a model.json:", errorText);
            alert(`⛔ ¡ALERTA CRÍTICA! Error de ACCESO al modelo: ${errorText} Por favor, verifica la ruta y que el servidor web esté funcionando.`);
            return; // Detenemos la ejecución si no podemos acceder al archivo
        }
        console.log("✅ model.json accesible por red. Procediendo a cargar el modelo con TensorFlow.js...");
        alert("¡Bien! El archivo model.json es accesible. Ahora TensorFlow.js intentará cargarlo.");

        // Intentamos cargar el modelo con TensorFlow.js
        modelo = await tf.loadLayersModel(modelUrl);

        console.log("✅ Modelo cargado correctamente por TensorFlow.js.");
        alert("🥳 ¡ÉXITO! El modelo se cargó correctamente. Ahora puedes predecir.");
        document.getElementById('btnPredecir').disabled = false;

        // Opcional: Mostrar el resumen del modelo en consola para verificar el inputShape
        // Esto solo funciona si el modelo se cargó correctamente
        if (modelo && modelo.inputs && modelo.inputs[0]) {
            console.log("Input shape del modelo cargado:", modelo.inputs[0].shape);
            alert(`Info: El modelo tiene un inputShape de ${JSON.stringify(modelo.inputs[0].shape)}. Esto es lo que esperábamos.`);
        } else {
             alert("¡Advertencia! El modelo se cargó, pero no pude verificar su inputShape. Puede que haya algo raro.");
        }


    } catch (error) {
        console.error("❌ Error CRÍTICO cargando el modelo con TensorFlow.js:", error);
        let errorMessage = `ERROR AL CARGAR EL MODELO: ${error.message}.`;

        if (error.message.includes("An InputLayer should be passed either a `batchInputShape` or an `inputShape`")) {
            errorMessage += "\n\nDIAGNÓSTICO: Este es el error EXACTO que sugiere que el 'model.json' está MAL GENERADO o CORRUPTO. Asegúrate de que el modelo Python se exportó con 'Input(shape=(28, 28, 1))' y que la versión que copiaste a la web es la NUEVA y CORRECTA.";
        } else if (error.message.includes("Failed to fetch")) {
             errorMessage += "\n\nDIAGNÓSTICO: 'Failed to fetch' sugiere un problema de red (el navegador no pudo descargar model.json) o que la ruta es INCORRECTA. ¡VERIFICA la ruta 'modelo_js/model.json' y que los archivos estén en tu servidor!";
        } else if (error.message.includes("SyntaxError: Unexpected token")) {
            errorMessage += "\n\nDIAGNÓSTICO: 'SyntaxError' al cargar el JSON. Esto significa que el archivo 'model.json' NO ES UN JSON VÁLIDO. Podría estar corrupto o no ser un archivo de texto JSON real.";
        } else {
            errorMessage += "\n\nDIAGNÓSTICO: Este es un error inesperado al cargar el modelo. Revisa la consola para más detalles.";
        }

        alert(`🔥 ¡ERROR FATAL! No se pudo cargar el modelo. Detalles:\n\n${errorMessage}`);
        document.getElementById('btnPredecir').disabled = true; // Deshabilitar si falla
    }
}

// Carga el modelo al iniciar la página
cargarModelo();

// Función para predecir el dibujo
function predecir() {
    if (!modelo) {
        alert("⚠️ ¡ERROR! El modelo aún no está cargado. No se puede predecir. Revisa los errores anteriores.");
        return;
    }

    console.log("Preparando imagen para predicción...");
    alert("Procesando tu dibujo para predecir...");

    try {
        const imagen = tf.browser.fromPixels(canvas, 1) // Obtener imagen en escala de grises
            .resizeNearestNeighbor([28, 28]) // Redimensionar a 28x28
            .toFloat() // Convertir a float
            .div(255.0) // Normalizar de 0 a 1
            .reshape([1, 28, 28, 1]); // Añadir dimensión de batch y canal

        console.log("Imagen preprocesada. Realizando predicción...");
        const pred = modelo.predict(imagen);
        const index = pred.argMax(1).dataSync()[0]; // Obtener el índice de la clase con mayor probabilidad
        const clase = clases[index];

        document.getElementById('resultado').innerText = `Resultado: ${clase}`;
        alert(`¡Predicción lista! Tu dibujo es un: ${clase}`);

        imagen.dispose(); // Libera la memoria del tensor
        pred.dispose(); // Libera la memoria del tensor
        console.log("Predicción completada. Tensors liberados.");

    } catch (predictError) {
        console.error("❌ Error durante la predicción:", predictError);
        alert(`🚨 ¡ERROR al predecir! Asegúrate de que el modelo se cargó correctamente y el canvas tiene un dibujo. Detalles: ${predictError.message}`);
    }
}