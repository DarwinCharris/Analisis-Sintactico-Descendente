let tableM = {};
function initializeTableM(nonTerminals, terminals) {
  nonTerminals.forEach(nonTerminal => {
    tableM[nonTerminal] = {};
    terminals.forEach(terminal => {
      tableM[nonTerminal][terminal] = null;
    });
    tableM[nonTerminal]['$'] = null; // Simbolo de fin de entrada
  });
}

// Construye la tabla M
function buildTableM(productions, firsts, follows) {
  productions.forEach(([left, right]) => {
    // Obtén FIRST(α) para la producción A -> α
    const firstAlpha = getFirst(right, firsts);
    firstAlpha.forEach(symbol => {
      if (symbol !== 'ε') {
        tableM[left][symbol] = `${left} -> ${right}`;  // Añadido el uso correcto de las comillas
      }
    });
    // Si ε está en FIRST(α), usar FOLLOW(A)
    if (firstAlpha.includes('ε')) {
      follows[left].forEach(symbol => {
        tableM[left][symbol] = `${left} -> ${right}`;  // Añadido el uso correcto de las comillas
      });
    }
  });
}
