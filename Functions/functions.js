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

function calculateFirst(rightPart) {
  let firstSets = {};

  // Inicializar el conjunto "primero" para cada no terminal
  for (let produccion of rightPart) {
    firstSets[produccion.NTerm] = new Set();
  }

  // Función para calcular el primero de una cadena específica
  function firstOfString(str) {
    let firstSet = new Set();
    let canBeEmpty = true;

    for (let i = 0; i < str.length; i++) {
      canBeEmpty = false;
      if (!(str[i] >= "A" && str[i] <= "Z")) {
        // Es un terminal de un solo carácter
        firstSet.add(str[i]);
        canBeEmpty = false;
        break;
      } else {
        // Es un no terminal
        for (let f of firstSets[str[i]]) {
          if (f !== "&") {
            firstSet.add(f);
          } else {
            canBeEmpty = true;
          }
        } // A -> B  -> epsilon
        if (!canBeEmpty) {
          break;
        }
      }
    }

    if (canBeEmpty) {
      firstSet.add("&");
    }
    return firstSet;
  }

  // Calcular el conjunto primero de cada no terminal
  let changed = true;
  while (changed) {
    changed = false;
    for (let produccion of rightPart) {
      let nterm = produccion.NTerm;
      for (let production of produccion.productions) {
        let beforeSize = firstSets[nterm].size;
        let firstSetForProduction = firstOfString(production);

        for (let f of firstSetForProduction) {
          firstSets[nterm].add(f);
        }

        if (firstSets[nterm].size > beforeSize) {
          changed = true;
        }
      }
    }
  }
  for (let grm of rightPart) {
    for (let prod of grm.productions) {
      let lista = customSplit(prod);
      let i = 0;
  
      // Verificar que lista[0] tenga un conjunto de primeros en `firstSets`
      if (firstSets[lista[0]] && (lista[0].length === 2 || (lista[i] >= "A" && lista[i] <= "Z"))) {
        if (firstSets[lista[0]].has('&')) {
          // Verificar que lista[1] también tenga un conjunto de primeros
          if (firstSets[lista[1]] && (lista[1].length === 2 || (lista[i] >= "A" && lista[i] <= "Z"))) {
            firstSets[lista[1]].forEach(valor => firstSets[grm.NTerm].add(valor));
          } else if (lista[1]) {
            firstSets[grm.NTerm].add(lista[1]);
          }
        }
      }
    }
  }
  
  return firstSets;
}

class Follow {
  constructor(grammar, firstSet) {
    this.data = new Map();
    this.generate(grammar, firstSet);
  }

  add(non_terminal, set) {
    const existing_set = this.data.get(non_terminal) || new Set();
    this.data.set(non_terminal, new Set([...existing_set, ...set]));
  }

  get(non_terminal) {
    const set = this.data.get(non_terminal);
    if (!set) throw new Error(`Non-terminal '${non_terminal}' not found.`);
    return set;
  }

  generate(grammar, firstSet) {
    function _follow(non_terminal, stack = new Set()) {
      stack.add(non_terminal);
      let follow = new Set();

      grammar.rightPart.forEach((prod) => {
        const header = prod.NTerm;
        const body = prod.productions;

        for (let i = 0; i < body.length; i++) {
          const symbol = body[i];

          if (symbol === non_terminal) {
            const beta = body.slice(i + 1);

            if (beta.length === 0 && !stack.has(header)) {
              follow = new Set([...follow, ..._follow(header, stack)]);
              if (header === "S") {
                follow.add("$");
              }
            } else {
              const firstBeta = beta.reduce(
                (acc, symbol) => new Set([...acc, ...firstSet[symbol]]),
                new Set()
              );

              follow = new Set([
                ...follow,
                ...[...firstBeta].filter((item) => item !== "&"),
              ]);

              if (firstBeta.has("&") && !stack.has(header)) {
                follow = new Set([...follow, ..._follow(header, stack)]);
                if (header === "S") {
                  follow.add("$");
                }
              }
            }
          }
        }
      });

      return follow;
    }

    const S = "S";
    this.add(S, new Set(["$"]));

    grammar.rightPart.forEach((prod) => {
      const non_terminal = prod.NTerm;
      this.add(non_terminal, _follow(non_terminal));
    });
  }

  print() {
    const table_data = Array.from(this.data.entries()).map(([key, value]) => ({
      non_terminal: key,
      follow: Array.from(value),
    }));
    console.table(table_data);
  }
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
  followData.data.forEach((set, key) => {
    result[key] = Array.from(set);
  });
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
        console.error("Error: el símbolo no coincide.");
        return;
      }
    } else {
      // X es un no terminal
      const production = M[X][a];
      console.log("");
      console.log(production);
      console.log("");
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
        console.error("Error: no hay producción en la tabla para este par.");
        return;
      }
    }
  }
  console.log("Cadena no aceptada.");
}

function parse(input, M) {
  // Referencias a los elementos del DOM
  const stepsContainer = document.getElementById("stepsContainer");
  const resultContainer = document.getElementById("resultContainer");

  // Limpiar los contenedores antes de empezar
  stepsContainer.innerHTML = "";
  resultContainer.innerHTML = "";

  let stack = ["$", "S"];
  input += "$"; // Agregamos el símbolo de fin de cadena a la entrada

  // Función para mostrar cada paso con estilos grandes
  function printStep(step) {
    const stepElement = document.createElement("p");
    stepElement.textContent = step;
    stepElement.style.fontSize = "24px"; // Aumentar tamaño de letra
    stepElement.style.marginBottom = "10px";
    stepElement.style.whiteSpace = "pre"; // Mantener espacios en blanco
    stepsContainer.appendChild(stepElement);
  }

  // Ciclo para el análisis de la cadena
  while (stack.length > 0) {
    printStep(`${printstack(stack)}         ${input}`);

    let X = stack.pop();
    let a = input[0];

    if (X === "'") {
      if (stack.length >= 2) {
        X = stack.pop() + X;
      }
    }

    // Verificar si hemos alcanzado el fin de la cadena
    if (X === "$" && a === "$") {
      return "Cadena aceptada.";
    }

    if (isTerminal(X) || X === "$") {
      if (X === a) {
        input = input.slice(1);
      } else {
        return "Cadena no aceptada: el símbolo no coincide.";
      }
    } else {
      const production = M[X][a];
      if (production !== null) {
        printStep(`Producción: ${production}`);
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
        return "Cadena no aceptada: no hay producción en la tabla para este par.";
      }
    }
  }

  return "Cadena no aceptada.";
}



// Función para verificar si un símbolo es terminal
function isTerminal(symbol) {
  return !/[A-Z]/.test(symbol);
}

/*
let formattedStr = "";
// NO BORRAR NINGUN CONSOLE 
formattedStr = "S->S,T\r\nS->T\r\nT->id\r\nT->id(S)";
let [terminales, noterminales, gramatica] = components(String(formattedStr));
let nueva = leftRecursion(gramatica);
let n2 = factorization(nueva);
let [terminales2, noterminales2] = newcomponents(n2);
console.log("Nueva gramatica");
console.log(n2.rightPart);
console.log("Terminales");
console.log(terminales2);
console.log("No terminales");
console.log(noterminales2);
console.log("Primeros");
let first = calculateFirst(n2.rightPart);
console.log(convertFirstToArray(first));
const newGrammar = splitProduction(n2);
console.log("Siguientes");
const follow = new Follow(newGrammar, first);
console.log(convertFollowToArray(follow));
const followsa = convertFollowToObject(follow);
console.log("Siguientes para tabla M"); //son los mismos de arriba pero con una estructura diferente
console.log(followsa);
console.log("Primeros para tabla M"); //son los mismos de arriba pero con una estructura diferente
firstnew = convertSetsToArrays(first);
console.log(firstnew);
initializeTableM(noterminales2, terminales2);
buildTableM(splitProvarious(n2), firstnew, followsa);
console.log("Tabla M");
console.log(tableM);
console.log("Reconocer cadena");
console.log(parse("(id)i", tableM));
*/



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



// HACE PARTE DEL FRONT ESTOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO ----------------------------------------------------------------------------------
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
      console.log( n2.rightPart);
      let first = calculateFirst(n2.rightPart);
      for (const i in first) {
        console.log(i);
        console.log(first[i]);
      }

      let formattedData = formatProductionsAsLists(n2.rightPart);
      let formattedProductionsText = "Producciones:\n";
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

      console.log("Siguientes");
      const newGrammar = splitProduction(n2);
      const follow = new Follow(newGrammar, first);
      const followsa = convertFollowToObject(follow);
      
      // Mostrar el conjunto de "Follow" en la página
      let formattedFollowSetsText = "";
      for (const [nonTerminal, followSet] of Object.entries(followsa)) {
        formattedFollowSetsText += `Siguiente(${nonTerminal}) = { ${Array.from(followSet).join(", ")} }\n`;
      }      
      document.getElementById("formattedFollowSets").textContent = formattedFollowSetsText;

      //TABLA MMMMMMMMMMMM
      // Obtener terminales y no terminales
      // Agregar explícitamente el símbolo $ a la lista de terminales si no está presente
      if (!terminales2.includes('$')) {
        terminales2.push('$');
      }

      // Inicializar la tabla M con los no terminales y terminales
      initializeTableM(noterminales2, terminales2);
      buildTableM(splitProvarious(n2), convertSetsToArrays(first), convertFollowToObject(follow));

      // Obtener la referencia de la tabla HTML
      const tableMElement = document.getElementById("tableM");
      const tableBody = tableMElement.querySelector("tbody");

      // Crear encabezados de columna (terminales), incluyendo $
      let headerRow = "<th>N / T</th>";
      terminales2.forEach(terminal => {
        headerRow += `<th>${terminal}</th>`;
      });
      tableMElement.querySelector("thead").innerHTML =`<tr>${headerRow}</tr>`;

      // Llenar la tabla con las filas (no terminales)
      noterminales2.forEach(nonTerminal => {
        let row = `<tr><td>${nonTerminal}</td>`; // Primera columna con el no terminal
        terminales2.forEach(terminal => {
          // Obtener la producción para cada no terminal y terminal
          const production = tableM[nonTerminal] && tableM[nonTerminal][terminal] ? tableM[nonTerminal][terminal] : "";
          row +=  `<td>${production}</td>`;
        });
        row += `</tr>`;
        tableBody.innerHTML += row; // Agregar la fila a la tabla
      });


      //PA EL ALGORITMO
      // Evento para el botón de "submit"
      document.getElementById("submitButton").addEventListener("click", function () {
        const input = document.getElementById("cadena").value;
      
        if (!input) {
          alert("Por favor ingrese una cadena.");
          return;
        }
      
        const result = parse(input, tableM);
      
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = "";
        const resultText = document.createElement("p");
        resultText.textContent = result;
        resultText.style.fontWeight = "bold";
        resultText.style.fontSize = "26px";
        resultText.style.color = result.includes("aceptada") ? "green" : "red";
        resultContainer.appendChild(resultText);
      });
      

    
    };
    reader.readAsText(file);
  }
});
