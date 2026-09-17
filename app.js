const inputText = document.getElementById("inputText");
const outputCode = document.getElementById("outputCode");

const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");

const highlightedCode = document.getElementById("highlightedCode");
const highlightedCodeContent = highlightedCode.querySelector("code");

// ========================================
// RESALTADO DE SINTAXIS
// ========================================

function highlightCode(code) {

    // Primero escapamos HTML para evitar que el código
    // se interprete como HTML.
    let highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Strings
    highlighted = highlighted.replace(
        /(&quot;.*?&quot;|".*?")/g,
        '<span class="code-string">$1</span>'
    );

    // DigiKeyboard
    highlighted = highlighted.replace(
        /\bDigiKeyboard\b/g,
        '<span class="code-keyword">DigiKeyboard</span>'
    );

    // Funciones
    highlighted = highlighted.replace(
        /\b(print|sendKeyStroke|delay)\b/g,
        '<span class="code-function">$1</span>'
    );

    // KEY_...
    highlighted = highlighted.replace(
        /\bKEY_[A-Z0-9_]+\b/g,
        '<span class="code-constant">$&</span>'
    );

    // MOD_...
    highlighted = highlighted.replace(
        /\bMOD_[A-Z0-9_]+\b/g,
        '<span class="code-constant">$&</span>'
    );

    // Números
    highlighted = highlighted.replace(
        /\b\d+\b/g,
        '<span class="code-number">$&</span>'
    );

    // Comentarios
    highlighted = highlighted.replace(
        /(\/\/.*)$/gm,
        '<span class="code-comment">$1</span>'
    );

    highlightedCodeContent.innerHTML = highlighted || " ";
}

// ========================================
// GENERAR CARÁCTER ESPECIAL
// ========================================

function generateSpecialCharacter(character) {
    const mapping = LATAM_MAP[character];

    if (!mapping) {
        return "";
    }

    if (mapping.type === "keystroke") {
        if (mapping.modifier) {
            return `DigiKeyboard.sendKeyStroke(${mapping.key}, ${mapping.modifier});`;
        }

        return `DigiKeyboard.sendKeyStroke(${mapping.key});`;
    }

    return "";
}


// ========================================
// GENERAR CÓDIGO DIGIKEYBOARD
// ========================================

function generateCode(text) {
    let code = "";
    let normalText = "";

    // Escribir el texto normal acumulado
    function flushNormalText() {
        if (normalText.length === 0) {
            return;
        }

        const escaped = normalText
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

        code += `DigiKeyboard.print("${escaped}");\n`;

        normalText = "";
    }

    // Analizar cada carácter
    for (const character of text) {

        // ¿Es un carácter especial definido en LATAM_MAP?
        if (LATAM_MAP[character]) {

            // Primero escribimos el texto normal pendiente
            flushNormalText();

            // Generamos la pulsación correspondiente
            const generated = generateSpecialCharacter(character);

            if (generated) {
                code += `${generated}\n`;
            }

        } else {

            // Carácter normal
            normalText += character;
        }
    }

    // Escribir lo que haya quedado pendiente
    flushNormalText();

    return code.trim();
}


// ========================================
// BOTÓN GENERAR
// ========================================

generateButton.addEventListener("click", () => {

    const text = inputText.value;

    if (!text) {
        outputCode.value = "";
        highlightedCodeContent.innerHTML = "";
        return;
    }

    const generatedCode = generateCode(text);

    outputCode.value = generatedCode;

    highlightCode(generatedCode);
});


// ========================================
// BOTÓN COPIAR
// ========================================

copyButton.addEventListener("click", async () => {

    if (!outputCode.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(outputCode.value);

        copyButton.textContent = "¡Copiado!";

        setTimeout(() => {
            copyButton.textContent = "Copiar código";
        }, 1500);

    } catch (error) {
        console.error("No se pudo copiar:", error);
    }
});

// ========================================
// SINCRONIZAR SCROLL
// ========================================

outputCode.addEventListener("scroll", () => {

    highlightedCode.style.transform =
        `translate(${-outputCode.scrollLeft}px, ${-outputCode.scrollTop}px)`;

});