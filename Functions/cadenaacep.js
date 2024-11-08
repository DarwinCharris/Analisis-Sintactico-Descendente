const M = {
  S: { i: null, d: null, "(": "S->BS'", ")": null, $: "S ->BS'" },
  "S'": { i: "S'->idS'", d: null, "(": null, ")": null, $: "S' ->&" },
  B: { i: "B ->&", d: null, "(": "B->(id)i", ")": null, $: "B ->&" },
};


function parse(input,M) {
  let stack = ["$", "S"]; // Inicializamos la pila con el símbolo de fin de cadena y el símbolo inicial S
  let index = 0; // Apuntador al símbolo actual de la cadena de entrada
  input += "$"; // Agregamos el símbolo de fin de cadena a la entrada

  while (stack.length > 0) {
    let X = stack.pop(); // Obtenemos el símbolo en la cima de la pila
    let a = input[index]; // Obtenemos el símbolo actual de la entrada

    if (X === "$" && a === "$") {
      console.log("Cadena aceptada.");
      return;
    }

    if (isTerminal(X) || X === "$") {
      if (X === a) {
        index++; // Avanzamos en la cadena de entrada
      } else {
        console.error("Error: el símbolo no coincide.");
        return;
      }
    } else {
      // X es un no terminal
      const production = M[X][a];
      if (production!== null) {
        const [left, right] = production.split("->");
        if (right !== "&") {
          for (let i = right.length - 1; i >= 0; i--) {
            stack.push(right[i]);
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

// Función para verificar si un símbolo es terminal
function isTerminal(symbol) {
  return !/[A-Z]/.test(symbol);
}

parse("id$",M);
