class Produccion {
  constructor(NTerm, productions) {
    this.NTerm = NTerm; // Atributo NTerm
    this.productions = productions; // Lista de producciones
  }
}
class Gramatica {
  constructor() {
    this.rightPart = []; // Inicializa la lista de producciones
  }

  add(tag, production) {
    // Busca si el tag ya existe como NTerm
    const existingProduccion = this.rightPart.find(
      (prod) => prod.NTerm === tag
    );

    if (!existingProduccion) {
      // Si no existe, crea un nuevo objeto Produccion y lo añade a la lista
      this.rightPart.push(new Produccion(tag, [production]));
    } else {
      // Si existe, agrega la producción a la lista existente
      if (!existingProduccion.productions.includes(production)) {
        existingProduccion.productions.push(production);
      }
    }
  }
}
function validate(content) {
  //content is the txt content (String)
  // if content is ''
  if (content === "") {
    return false;
  }
  //Remove blanck spaces
  content = content.replace(" ", "");
  // split the content
  var elements = content.split("\r\n");
  for (let element of elements) {
    // La estructura esperada es una letra mayúscula seguida de '->'
    // Longitud mínima de 4: "A->A"
    if (element.length < 4) {
      return false;
    }
    if (!(element[0] >= "A" && element[0] <= "Z")) {
      return false;
    }
    if (!(element[1] === "-" && element[2] === ">")) {
      return false;
    }
  }
  return true;
}
function findTerminal(str) {
  let result = "";

  for (let i = 0; i < str.length; i++) {
    if (str[i] >= "A" && str[i] <= "Z") {
      break; // Salir del bucle si se encuentra una letra mayúscula
    }
    result += str[i]; // Agregar el carácter al resultado
  }

  return result;
}
function splitString(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    result.push(str[i]);
  }
  return result;
}
function components(content) {
  let Terminals = [];
  let NoTerminals = [];
  let gram = new Gramatica();
  //Remove blanck spaces
  content = content.replace(" ", "");
  // split the content
  var elements = content.split("\r\n");
  for (let element of elements) {
    //Left part
    if (!NoTerminals.includes(element[0])) {
      NoTerminals.push(element[0]);
    }
    //Right part
    let right = element.substring(3);
    let i = 0;
    gram.add(element[0], right);
    while (i < right.length) {
      let chart = right[i];
      if (chart >= "A" && chart <= "Z") {
        if (!NoTerminals.includes(chart)) {
          NoTerminals.push(chart);
        }
      } else {
        let sub = right.substring(i);
        let terminal = findTerminal(sub);
        let terminals = splitString(terminal);
        for (let ter of terminals) {
          if (ter !== "" && !Terminals.includes(ter)) {
            Terminals.push(ter);
          }
        }
        if (terminal.length != 0) {
          i = i + terminal.length - 1;
        }
      }
      i += 1;
    }
  }
  return [Terminals, NoTerminals, gram];
}
function leftRecursion(gram) {
  let newgram = new Gramatica();
  for (let element of gram.rightPart) {
    let X = [];
    let Y = [];
    for (let production of element.productions) {
      if (production[0] === element.NTerm) {
        X.push(production.substring(1));
      } else {
        Y.push(production);
      }
    }
    if (X.length > 0) {
      for (let yi of Y) {
        if (yi === "&") {
          newgram.add(`${element.NTerm}`, `${element.NTerm}'`);
        } else {
          newgram.add(`${element.NTerm}`, `${yi}${element.NTerm}'`);
        }
      }
      for (let xi of X) {
        if (xi === "&") {
          newgram.add(`${element.NTerm}'`, `${element.NTerm}'`);
        } else {
          newgram.add(`${element.NTerm}'`, `${xi}${element.NTerm}'`);
        }
      }
      newgram.add(`${element.NTerm}'`, "&");
    } else {
      newgram.rightPart.push(element);
    }
  }
  return newgram;
}
function contarCifrasEnComun(lista) {
  if (lista.length === 0) return 0;

  // Tomamos el primer elemento como referencia
  let referencia = lista[0];
  let contador = 0;

  // Recorremos cada carácter de la referencia
  for (let i = 0; i < referencia.length; i++) {
    // Verificamos si todos los elementos tienen el mismo carácter en la posición actual
    if (lista.every((str) => str[i] === referencia[i])) {
      contador++;
    } else {
      break; // Sale del bucle al encontrar una diferencia
    }
  }

  return contador;
}
function factorization(gram) {
  let fact = new Gramatica();
  //Para casa A de A-> X|Y|... uso de pivote a cada elemento de la producción y busco el patron a partir del primer carácter
  for (let element of gram.rightPart) {
    let X = []; //No tienen patrón
    let Y = []; // Tienen patrón
    let production = element.productions;
    i = 0;
    j = 1;
    while (i < production.length) {
      while (j < production.length) {
        if (production[i][0] === production[j][0]) {
          Y.push(production[j]);
        }
        j += 1;
      }
      if (Y.length > 0) {
        Y.unshift(production[i]);
        break; //Hay patron, lo cual indica que hay recursividad (Solo existe un patron por producción)
      }
      i += 1;
      j = i + 1;
    }

    if (Y.length > 0) {
      //Encontrar el patrón
      let salto = contarCifrasEnComun(Y);
      let patron = Y[0].substring(0, salto);
      for (let prod of Y) {
        //agregar la parte del patrón
        fact.add(element.NTerm, `${patron}${element.NTerm}'`);
        // agregar la parte sin patrón
        if (prod.substring(salto) === "") {
          fact.add(`${element.NTerm}'`, "&");
        } else {
          fact.add(`${element.NTerm}'`, prod.substring(salto));
        }
      }
      for (let solos of X) {
        fact.add(element.NTerm, solos);
      }
    } else {
      for (let prod of production) {
        if (!Y.includes(prod)) {
          fact.add(element.NTerm, prod);
        }
      }
    }
  }
  return fact;
}
function newcomponents(gram) {
  let terminals = [];
  let noTerminals = [];
  for (let nter of gram.rightPart) {
    if (!noTerminals.includes(nter.NTerm)) {
      noTerminals.push(nter.NTerm);
    }
    for (let prod of nter.productions) {
      i = 0;
      while (i < prod.length) {
        if (prod[i] >= "A" && prod[i] <= "Z") {
          if (prod[i + 1] === "'") {
            i = i + 2;
          } else {
            i = i + 1;
          }
        } else {
          let termi = findTerminal(prod.substring(i));
          let lterminals = splitString(termi);
          for (let ter of lterminals) {
            if (ter !== "&" && !terminals.includes(ter)) {
              terminals.push(ter);
            }
          }
          if (termi.length != 0) {
            i = i + termi.length;
          }
        }
      }
    }
  }
  return [terminals, noTerminals];
}

function customSplit(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "'" && i > 0) {
      result[result.length - 1] += str[i];
    } else {
      result.push(str[i]);
    }
  }
  return result;
}

function calculateFirst(gram, noTerminales) {
  let first = {};
  let pendiente = {};
  for (let ter of gram.rightPart) {
    first[ter.NTerm] = new Set();
    pendiente[ter.NTerm] = new Set();
  }
  for (let termino of gram.rightPart) {
    for (let prod of termino.productions) {
      elemento = customSplit(prod);
      if (noTerminales.includes(elemento[0])) {
        pendiente[termino.NTerm].add(elemento[0]);
      } else {
        first[termino.NTerm].add(elemento[0]);
      }
    }
  }
  for (let key in pendiente) {
    if (pendiente[key] instanceof Set && pendiente[key].size === 0) {
      for (let otherKey in pendiente) {
        if (otherKey !== key && pendiente[otherKey].has(key)) {
          first[key].forEach((val) => first[otherKey].add(val));
          pendiente[otherKey].delete(key);
        }
      }
    }
  }
  //Arreglar el caso 3
  for (let grm of gram.rightPart) {
    for (let prod of grm.productions) {
      let lista = customSplit(prod);
      // Verificar que lista[0] tenga un conjunto de primeros en firstSets
      if (
        first[lista[0]] &&
        (lista[0].length === 2 || (lista[i] >= "A" && lista[i] <= "Z"))
      ) {
        if (first[lista[0]].has("&")) {
          // Verificar que lista[1] también tenga un conjunto de primeros
          if (
            first[lista[1]] &&
            (lista[1].length === 2 || (lista[i] >= "A" && lista[i] <= "Z"))
          ) {
            first[lista[1]].forEach((valor) => first[grm.NTerm].add(valor));
          } else if (lista[1]) {
            first[grm.NTerm].add(lista[1]);
          }
        }
      }
    }
  }
  return first;
}

function caso2(betha, b, prim, sig, terminales){
  if(terminales.includes(betha)){
    sig[b].add(betha)
  }else{
    prim[betha].forEach(val => sig[b].add(val))
  }
  return sig
}
function caso3i(a, b, pendiente){
  pendiente[b].add(a)
  return pendiente
}
function caso3ii(a,b, betha, pendiente, prim, terminales){
  if(!terminales.includes(betha)){
    if(betha ==='&'){
      pendiente[b].add(a)
    }
    else if(prim[betha].has('&')){
      pendiente[b].add(a)
    }
  }
  return pendiente
}

function Follow(gram, noterminales, terminales, primero){
  let sig={}
  let pendiente={}
  for(let elem of gram.rightPart){
    sig[elem.NTerm] = new Set();
    pendiente[elem.NTerm]= new Set();
  }
  sig[noterminales[0]].add('$')
  for(let elem of gram.rightPart){
    for(let prod of elem.productions){
      let rev = customSplit(prod)
      if (rev.length ===1){
        if(noterminales.includes(rev[0])){
          //Si solo tiene un elemento no terminal solo aplica el caso 3i
          pendiente = caso3i(elem.NTerm, rev[0], pendiente)
        }
      } else if (rev.length === 2){
        if(noterminales.includes(rev[0])){
          sig = caso2(rev[1], rev[0], primero,sig,terminales)
          pendiente = caso3ii(elem.NTerm,rev[0], rev[1], pendiente,primero,terminales)
        }
        if(noterminales.includes(rev[1])){
          pendiente = caso3i(elem.NTerm, rev[1],pendiente)
        }

      } else{
        //Caso 2 cuando alpha sea &
        if(noterminales.includes(rev[0])){
          sig = caso2(rev[1],rev[0],primero,sig,terminales)
        }else{
          let cond = true
          let i = 0
          let j = 1
          let k = 2
          while (cond){
            let alpha = rev[i]
            let b = rev[j]
            let betha = rev[k]
            if(noterminales.includes(b)){
              sig = caso2(betha, b, primero, sig, terminales)
              pendiente = caso3ii(elem.NTerm, b, betha,pendiente,primero,terminales)
            }
            i++;
            j++;
            k++;
            if(k>rev.length-1){
              cond = false
            }
          }
        }
        //caso 3i solo es posible si el ultimo elemento es no terminales
        if(noterminales.includes(rev[rev.length-1])){
          pendiente = caso3i(elem.NTerm, rev[rev.length-1], pendiente)
        }
      }
    }
  }
  //Administrar los pendientes
  for (let key in pendiente) {
    if (pendiente[key] instanceof Set && pendiente[key].size === 0) {
      for (let otherKey in pendiente) {
        if (otherKey !== key && pendiente[otherKey].has(key)) {
          sig[key].forEach(val => sig[otherKey].add(val));
          //Agregar el elemento que tenía pendiente
          pendiente[otherKey].delete(key)
        }
      }
    }

  }
  for(let key in sig){
    sig[key].delete('&')
  }
  return sig
}


function splitProduction(grammar) {
  let newProductions = {
    rightPart: [],
  };

  grammar.rightPart.forEach((prod) => {
    const { NTerm, productions } = prod;
    if (productions.length > 0) {
      productions.forEach((part) => {
        // Dividir la cadena en caracteres y procesar
        let i = 0;
        const filteredPart = [];
        while (i < part.length) {
          // Si encontramos una letra mayúscula seguida de un apóstrofe, tratamos como un solo símbolo
          if (
            i < part.length - 1 &&
            part[i].match(/[A-Z]/) &&
            part[i + 1] === "'"
          ) {
            filteredPart.push(part[i] + "'");
            i += 2; // Avanzamos 2 posiciones, ya que hemos procesado el par
          } else {
            filteredPart.push(part[i]);
            i++; // Avanzamos 1 posición para el siguiente carácter
          }
        }

        newProductions.rightPart.push({ NTerm, productions: filteredPart });
      });
    }
  });

  return newProductions;
}

// Para la printeada
function convertFirstToArray(input) {
  let result = [];
  for (let nonTerminal in input) {
    result.push([nonTerminal, ...Array.from(input[nonTerminal])]);
  }
  return result;
}

function convertFollowToArray(input) {
  let result = [];
  input.data.forEach((set, nonTerminal) => {
    result.push([nonTerminal, ...Array.from(set)]);
  });
  return result;
}

//Para tabla M

function convertFollowToObject(followData) {
  const result = {};
  for (const key in followData) {
    if (followData.hasOwnProperty(key)) {
      result[key] = Array.from(followData[key]);
    }
  }
  return result;
}

function convertSetsToArrays(first) {
  // Convertir FIRST
  const firstAsArrays = {};
  for (const [nonTerminal, set] of Object.entries(first)) {
    firstAsArrays[nonTerminal] = Array.from(set);
  }
  return firstAsArrays; // Devolvemos el objeto convertido
}

// cada produccion en una linea (para tabla M)
function splitProvarious(grammar) {
  let newProductions = {
    rightPart: [],
  };
  grammar.rightPart.forEach((prod) => {
    const { NTerm, productions } = prod;
    if (productions.length > 0) {
      productions.forEach((productions) => {
        newProductions.rightPart.push({ NTerm, productions });
      });
    }
  });
  return newProductions;
}

let tableM = {}; //Tabla M

function initializeTableM(nonTerminals, terminals) {
  nonTerminals.forEach((nonTerminal) => {
    tableM[nonTerminal] = {};
    terminals.forEach((terminal) => {
      tableM[nonTerminal][terminal] = null;
    });
    tableM[nonTerminal]["$"] = null;
  });
}

// Construye la tabla M
function buildTableM(grammar, firsts, follows) {
  grammar.rightPart.forEach(({ NTerm, productions }) => {
    // Obtén FIRST(α) para la producción A -> α
    const firstAlpha = getFirst(productions, firsts);
    firstAlpha.forEach((symbol) => {
      if (symbol !== "&") {
        tableM[NTerm][symbol] = `${NTerm}->${productions}`; // Añadir la producción
      }
    });
    // Si ε está en FIRST(α), usar FOLLOW(A)
    if (firstAlpha.includes("&")) {
      follows[NTerm].forEach((symbol) => {
        tableM[NTerm][symbol] = `${NTerm}->${productions}`; // Añadir la producción
      });
    }
  });
}

// Función getFirst: Obtiene el conjunto FIRST de una cadena de producción
function getFirst(productions, firsts) {
  let result = [];
  if (firsts[productions[0][0]]) {
    result = result.concat(firsts[productions[0][0]]);
  } else {
    result = result.concat(productions[0][0]);
  }
  return [...new Set(result)];
}

// para reconcimiento
function printstack(stack) {
  let str = "";
  for (let i = 0; i < stack.length; i++) {
    str += stack[i];
  }
  return str;
}

function parse(input, M) {
  let stack = ["$", "S"];
  input += "$"; // Agregamos el símbolo de fin de cadena a la entrada
  while (stack.length > 0) {
    console.log(`${printstack(stack)}         ${input}`);
    let X = stack.pop(); // Obtenemos el símbolo en la cima de la pila
    let a = input[0]; // Obtenemos el símbolo actual de la entrada

    if (X === "'") {
      if (stack.length >= 2) {
        X = stack.pop() + X;
      }
    }

    if (X === "$" && a === "$") {
      console.log("Cadena aceptada.");
      return true;
    }

    if (isTerminal(X) || X === "$") {
      if (X === a) {
        input = input.slice(1); // Avanzamos en la cadena de entrada
      } else {
        console.error("Cadena no aceptada");
        return;
      }
    } else {
      // X es un no terminal
      const production = M[X][a];
      console.log("");
      console.log(production);
      console.log("");
      if (production !== null && production !== undefined) {
        const [left, right] = production.split("->");
        if (right !== "&") {
          for (let i = right.length - 1; i >= 0; i--) {
            if (right[i] === "'") {
              stack.push(right[i - 1] + right[i]);
              i--;
            } else {
              stack.push(right[i]);
            }
          }
        }
      } else {
        console.error("Cadena no aceptada");
        return;
      }
    }
  }
}

function parse(input, M) {
  const stepsContainer = document.getElementById("stepsContainer");
  const resultContainer = document.getElementById("resultContainer");

  // Limpiar los contenedores antes de empezar
  stepsContainer.innerHTML = "";
  resultContainer.innerHTML = "";

  let stack = ["$", "S"];
  input += "$"; // Agregamos el símbolo de fin de cadena a la entrada

  function printStep(step) {
    stepsContainer.innerHTML += `<pre class="step">${step}</pre>`;
  }

  while (stack.length > 0) {
    // Alinear la pila y la entrada
    let stackString = printstack(stack);
    let alignedStep = `${stackString.padEnd(20)} ${input.padEnd(20)}`;

    // Mostrar la alineación
    printStep(alignedStep);

    let X = stack.pop();
    let a = input[0];
    

    if (X === "'") {
      if (stack.length >= 2) {
        X = stack.pop() + X;
      }
    }

    if (X === "$" && a === "$") {
      return "Cadena aceptada";
    }

    if (isTerminal(X) || X === "$") {
      if (X === a) {
        input = input.slice(1);
      } else {
        return "Cadena no aceptada";
      }
    } else {
      const production = M[X][a];
      printStep(""); // Vacío entre pasos
      if (production !== null){
        printStep(`Producción: ${production}`);
      }
      printStep(""); // Vacío entre pasos

      if (production !== null) {
        const [left, right] = production.split("->");
        if (right !== "&") {
          for (let i = right.length - 1; i >= 0; i--) {
            if (right[i] === "'") {
              stack.push(right[i - 1] + right[i]);
              i--;
            } else {
              stack.push(right[i]);
            }
          }
        }
      } else {
        return "Cadena no aceptada";
      }
    }
  }

  return "Cadena no aceptada";
}

// Función para verificar si un símbolo es terminal
function isTerminal(symbol) {
  return !/[A-Z]/.test(symbol);
}


function formatProductionsAsLists(rightPart) {
  const formattedProductions = [];
  for (let production of rightPart) {
    // La primera posición de cada sublista es el no terminal, seguido de sus producciones
    formattedProductions.push([production.NTerm, ...production.productions]);
  }
  return formattedProductions;
}

function formatFirstSetsAsLists(firstSets) {
  const result = [];
  for (let nonTerminal in firstSets) {
    // Convierte el Set a Array y lo agrega a una lista junto con el no terminal
    const firstList = [nonTerminal, ...Array.from(firstSets[nonTerminal])];
    result.push(firstList);
  }
  return result;
}























// F R O N T   E N  D  ----------------------------------------------------------------------------------
let txt = ""; // Variable para almacenar el contenido del archivo
let formattedStr = "";
const fileInput = document.getElementById("fileInput");
const fileContent = document.getElementById("fileContent");
const customButton = document.getElementById("customButton");

// Abrir el diálogo de selección de archivo al hacer clic en el botón personalizado
customButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const txt = e.target.result; // Guardar el contenido en la variable txt
      fileContent.textContent = txt; // Mostrar el contenido en la página
      console.log("Contenido del archivo:");
      console.log(txt);
      const lineas = txt.split("\r\n"); // Dividir el contenido en líneas
      formattedStr = lineas.join("\r\n"); // Formatear y unir con \r\n y envolver en comillas
      console.log("Cadena formateada:", String(formattedStr));
      let [terminales, noterminales, gramatica] = components(
        String(formattedStr)
      );
      let nueva = leftRecursion(gramatica);
      let n2 = factorization(nueva);
      for (let elemento of nueva.rightPart) {
        console.log(elemento);
      }
      let [terminales2, noterminales2] = newcomponents(n2);
      console.log(terminales2);
      console.log(noterminales2);
      console.log("Factorizada");
      console.log(n2.rightPart);
      let first = calculateFirst(n2, noterminales2);
      for (const i in first) {
        console.log(i);
        console.log(first[i]);
      }

      let formattedData = formatProductionsAsLists(n2.rightPart);
      let formattedProductionsText = "";
      formattedData.forEach((item) => {
        formattedProductionsText += `${item[0]} -> ${item
          .slice(1)
          .join(" | ")}\n`;
      });
      document.getElementById("formattedProductions").textContent =
        formattedProductionsText;

      let formattednter = noterminales2;
      let formattednterText = "N = { ";
      if (formattednter.length === 0) {
        formattednterText = "No hay no terminales";
      } else if (formattednter.length === 1) {
        formattednterText = `N = { ${formattednter[0]} `;
      } else {
        formattednter.forEach((item) => {
          if (item !== formattednter[formattednter.length - 1]) {
            formattednterText += `${item}, `;
          } else {
            formattednterText += `${item} `;
          }
        });
      }
      formattednterText += "}";
      document.getElementById("noterminales").textContent = formattednterText;

      let formattedter = terminales2;
      let formattedterText = "T = { ";
      if (formattedter.length === 0) {
        formattedterText = "No hay terminales";
      } else if (formattedter.length === 1) {
        formattedterText = `T = { ${formattedter[0]} `;
      } else {
        formattedter.forEach((item) => {
          if (item !== formattedter[formattedter.length - 1]) {
            formattedterText += `${item}, `;
          } else {
            formattedterText += `${item} `;
          }
        });
      }
      formattedterText += "}";
      document.getElementById("terminales").textContent = formattedterText;

      console.log("Primeros");
      let formattedFirstSets = formatFirstSetsAsLists(first);
      let formattedFirstSetsText = "";
      formattedFirstSets.forEach((item) => {
        formattedFirstSetsText += `Prim(${item[0]}) = { ${item
          .slice(1)
          .join(" ,")} }\n`;
      });
      document.getElementById("formattedFirstSets").textContent =
        formattedFirstSetsText;

      //SIGUIENTESSSSSSSSSSSSSSSSSSSSSSSSSS
      const newGrammar = splitProduction(n2);
      const follow = Follow(n2, noterminales2, terminales2, first);
      console.log("Siguientes");
      console.log(follow);
      const followsa = convertFollowToObject(follow);
      // Mostrar el conjunto de "Follow" en la página
      let formattedFollowSetsText = "";
      for (const [nonTerminal, followSet] of Object.entries(followsa)) {
        formattedFollowSetsText += `Siguiente(${nonTerminal}) = { ${Array.from(
          followSet
        ).join(", ")} }\n`;
      }
      document.getElementById("formattedFollowSets").textContent =
        formattedFollowSetsText;

      //TABLA MMMMMMMMMMMM
      // Obtener terminales y no terminales
      // Agregar explícitamente el símbolo $ a la lista de terminales si no está presente
      if (!terminales2.includes("$")) {
        terminales2.push("$");
      }

      // Inicializar la tabla M con los no terminales y terminales
      initializeTableM(noterminales2, terminales2);
      buildTableM(
        splitProvarious(n2),
        convertSetsToArrays(first),
        convertFollowToObject(follow)
      );

      // Obtener la referencia de la tabla HTML
      const tableMElement = document.getElementById("tableM");
      const tableBody = tableMElement.querySelector("tbody");

      // Crear encabezados de columna (terminales), incluyendo $
      let headerRow = "<th>N / T</th>";
      terminales2.forEach((terminal) => {
        headerRow += `<th>${terminal}</th>`;
      });
      tableMElement.querySelector("thead").innerHTML = `<tr>${headerRow}</tr>`;

      // Llenar la tabla con las filas (no terminales)
      noterminales2.forEach((nonTerminal) => {
        let row = `<tr><td>${nonTerminal}</td>`; // Primera columna con el no terminal
        terminales2.forEach((terminal) => {
          // Obtener la producción para cada no terminal y terminal
          const production =
            tableM[nonTerminal] && tableM[nonTerminal][terminal]
              ? tableM[nonTerminal][terminal]
              : "";
          row += `<td>${production}</td>`;
        });
        row += `</tr>`;
        tableBody.innerHTML += row; // Agregar la fila a la tabla
      });

      //PA EL ALGORITMO
      // Evento para el botón de "submit"
      document
        .getElementById("submitButton")
        .addEventListener("click", function () {
          const input = document.getElementById("cadena").value;

          if (!input) {
            alert("Por favor ingrese una cadena.");
            return;
          }

          // Llamar a la función parse con el valor de la entrada
          const result = parse(input, tableM);

          // Limpiar y mostrar el resultado
          const resultContainer = document.getElementById("resultContainer");
          resultContainer.innerHTML = ""; // Limpiar el contenedor de resultados
          const resultText = document.createElement("p");
          resultText.textContent = result;
          resultText.style.fontWeight = "bold";
          resultText.style.color = result.includes("no")
            ? "red"
            : "green";
          resultContainer.appendChild(resultText);
        });

      // Evento para el botón de "reset"
      document
        .getElementById("resetButton")
        .addEventListener("click", function () {
          // Limpiar el campo de entrada
          document.getElementById("cadena").value = "";

          // Limpiar los contenedores de pasos y resultados
          document.getElementById("stepsContainer").innerHTML = "";
          document.getElementById("resultContainer").innerHTML = "";

          // También puedes añadir estilos para resetear el formato visual si es necesario
          // Ejemplo: Resetear colores, tamaños o clases
          const stepsContainer = document.getElementById("stepsContainer");
          const resultContainer = document.getElementById("resultContainer");

          stepsContainer.style = ""; // Restaurar estilo de contenedor de pasos
          resultContainer.style = ""; // Restaurar estilo de contenedor de resultados
        });
    };
    reader.readAsText(file);
  }
});
