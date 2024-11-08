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

let tableM = {};
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
        tableM[NTerm][symbol] = `${NTerm} ->${productions}`; // Añadir la producción
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

// Datos de ejemplo
const terminals = ["i", "d", "(", ")"];
const nonTerminals = ["S", "S'", "B"];

// Estructura de FIRST para cada no terminal
const firsts = {
  S: ["("],
  "S'": ["i", "&"],
  B: ["(", "&"],
};

// Estructura de FOLLOW para cada no terminal
const follows = {
  S: ["$"],
  "S'": ["$"],
  B: ["i", "$"],
};

// Nueva gramática (estructura modificada)
const grammar = {
  rightPart: [
    { NTerm: "S", productions: ["BS'"] },
    { NTerm: "S'", productions: ["id", "&"] },
    { NTerm: "B", productions: ["(id)i", "&"] },
  ],
};

initializeTableM(nonTerminals, terminals);
// Construimos la tabla M
buildTableM(splitProvarious(grammar), firsts, follows);
// Mostrar la tabla M
console.log(tableM);
