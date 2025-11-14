const API_KEY = "AIzaSyD95VQO1U3blZaObl79-ksJxgCU997pPXI";
const MODEL = "gemini-2.5-flash-lite";
async function generar_pregunta (){ //funcion asincrona ( para que espera la respuesta)

const temas = [

        "Nombre de personajes de marvel",
        "Material de las armas de los superheroes de marvel",
        "Nombre del actor que interpreta al personaje de marvel en liveaction",
        "Armas o artefactos importantes en la historiacde marvel",
        "Eventos o sacrificios relevantes en el MCU"
    
];

const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
const prompt = `En el contexto de JavaScript, CSS y HTML. Genera una pregunta de opción múltiple sobre el siguiente tema ${temaAleatorio}. Proporciona cuatro opciones de respuesta y señala cuál es la correcta.    
            Genera la pregunta y sus posibles respuestas en formato JSON como el siguiente ejemplo, asegurándote de que el resultado SÓLO contenga el objeto JSON y no texto adicional enseguida te doy tres ejemplos:
    1.- Nombre de personajes
    {
        "question": "¿Cuál es el nombre real de Black Panther?",
        "options": [
            "a) T'Challa",
            "b) M'Baku",
            "c) N'Jadaka",
            "d) Zuri"
        ],
        "correct_answer": "a) T'Challa",
        "explanation": "T'Challa es el rey de Wakanda y el portador del título de Black Panther."
    }
    2.- Material de las armas
    {
        "question": "¿Qué metal especial se encuentra en abundancia en Wakanda?",
        "options": [
            "a) Adamantium",
            "b) Vibranium",
            "c) Uru",
            "d) Carbonadium"
        ],
        "correct_answer": "b) Vibranium",
        "explanation": "Wakanda es conocida por su gran reserva de vibranium, un metal extremadamente resistente."
    }
    3.- Nombre del actor que interpreta al personaje en liveaction
    {
        "question": "¿Quién interpreta a Spider-Man en el MCU?",
        "options": [
            "a) Tobey Maguire",
            "b) Andrew Garfield",
            "c) Tom Holland",
            "d) Dylan O'Brien"
        ],
        "correct_answer": "c) Tom Holland",
        "explanation": "Tom Holland interpreta a Spider-Man desde su debut en 'Captain America: Civil War'."
}

            `;


// definir la url para llamada a apy
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

//Completar la función respuestaAPI()
try {
        const response = await fetch( //peticion con el fetch
            url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    // Opcional: añadir la configuración de generación
                    generationConfig: {
                        temperature: 0.25,
                        responseMimeType: "application/json"
                    },
                }),
            }
        );

        // Manejo de errores de HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(errorData)}`); // lanza el error
        }

        const data = await response.json();
        console.log("Respuesta transformada a json:", data);

        
        // Extracción simple del texto de la respuesta, asumiendo que la respuesta tiene al menos una 'candidate' y 'part'     
        const textResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        const textResultTrimmed = textResult.trim();
        const firstBraceIndex = textResultTrimmed.indexOf('{');
        const lastBraceIndex = textResultTrimmed.lastIndexOf('}');
        const jsonString = textResultTrimmed.substring(firstBraceIndex, lastBraceIndex + 1);

        if (jsonString) {            
            const questionData = JSON.parse(jsonString);
            console.log(questionData);
            return questionData;
        } else {
            console.log("No se pudo extraer el texto de la respuesta.");
        }

    } catch (error) {
        console.error("Hubo un error en la petición:", error);
        document.getElementById('question').textContent = 'Error al cargar la pregunta. Por favor, revisa la clave API o la consola.';
        return null;
    }
}

async function cargarPregunta() {
    // Mostrar mensaje de carga
    document.getElementById('question').className = 'text-warning';
    document.getElementById('question').textContent = 'Cargando pregunta de Gemini...';
    document.getElementById('options').innerHTML = '';

    const datosPregunta = await generar_pregunta();
    console.log(datosPregunta);

    if (datosPregunta) {
        document.getElementById('question').className = 'text-success';
        console.log("Datos de la pregunta recibidos:", datosPregunta);
        desplegarPregunta(datosPregunta);
    }
}

//Cargar contadores y la primera pregunta al iniciar
window.onload = () => {
    console.log("Página cargada y función inicial ejecutada.");
    desplegarContadores();
    cargarPregunta();    
};
// despliega la respuesta y verifica 
function desplegarPregunta(pre){

    const pregunta = document.getElementById('question');//sacamos la pregunta
    const opciones = document.getElementById('options'); //sacamos las opciones
    
    pregunta.textContent=pre.question; // ponemos la pregunta al inicio
    opciones.innerHTML= ''; //limipiamo lo que habia anteriormente en los botones

pre.options.forEach(opcion => { // ponemos las opciones
        const btn = document.createElement("button");
        btn.className = "btn btn-success";
        btn.textContent = opcion; //ponemos el boton y la opcion

        // AQUÍ se valida directamente
        btn.onclick = () => {
            if (opcion === pre.correct_answer) {
                alert("Respuesta correcta \n" + pre.explanation);
                actualizarContadores("correcta"); // significa que hay una pregunta correcta
            } else {
                alert("Respuesta incorrecta, la respuesta correcta era:\n" + pre.correct_answer + "\n Explicacion: \n" + pre.explanation);
                actualizarContadores("incorrecta");
            }

            cargarPregunta(); // cargar siguiente
        };

        opciones.appendChild(btn);
    });
}

//localstorage
function desplegarContadores() {
    const correctasGuardadas = localStorage.getItem("correctas");
    const incorrectasGuardadas = localStorage.getItem("incorrectas");

    document.getElementById("correctas").textContent = correctasGuardadas ? correctasGuardadas : 0;
    document.getElementById("incorrectas").textContent = incorrectasGuardadas ? incorrectasGuardadas : 0;
}

function actualizarContadores(tipo) {
    if (tipo === "correcta") {
        let c = parseInt(document.getElementById("correctas").textContent);
        c++;
        document.getElementById("correctas").textContent = c;
        localStorage.setItem("correctas", c); // GUARDAR
    }

    if (tipo === "incorrecta") {
        let i = parseInt(document.getElementById("incorrectas").textContent);
        i++;
        document.getElementById("incorrectas").textContent = i;
        localStorage.setItem("incorrectas", i); // GUARDAR
    }
}
