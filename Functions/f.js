function splitProvarious(grammar) {
  let newProductions = {
    rightPart: [],
  };
  grammar.rightPart.forEach((prod) => {
    const { NTerm, productions } = prod;
    if (productions.length > 0) {
      productions.forEach((production) => {
        newProductions.rightPart.push({
          leftPart: NTerm,
          rightPart: production.split(""),
        });
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

// Función getFirst: Obtiene el conjunto FIRST de una cadena de producción
function getFirst(productions, firsts) {
  let result = [];
  if (productions.length > 0) {
    const firstSymbol = productions[0];
    if (firsts[firstSymbol]) {
      result = result.concat(firsts[firstSymbol]);
    } else {
      result = result.concat(firstSymbol);
    }
  }
  return [...new Set(result)];
}

// Construye la tabla M
function buildTableM(grammar, firsts, follows) {
  grammar.rightPart.forEach(({ leftPart, rightPart }) => {
    // Obtén FIRST(α) para la producción A -> α
    const firstAlpha = getFirst(rightPart, firsts);
    firstAlpha.forEach((symbol) => {
      if (symbol !== "ε") {
        tableM[leftPart][symbol] = `${leftPart} -> ${rightPart.join(" ")}`; // Añadir la producción
      }
    });

    // Si ε está en FIRST(α), usar FOLLOW(A)
    if (firstAlpha.includes("ε")) {
      follows[leftPart].forEach((symbol) => {
        tableM[leftPart][symbol] = `${leftPart} -> ${rightPart.join(" ")}`; // Añadir la producción
      });
    }
  });
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
