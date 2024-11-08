// Estructura inicial
const followData = new Map([
    ["S", new Set(["$"])],
    ["S'", new Set(["$"])],
    ["B", new Set(["i", "$"])]
  ]);
  
  // Conversión a un objeto con arrays
  const follows = {};
  followData.forEach((set, key) => {
    follows[key] = Array.from(set);
  });
  
  console.log(follows);
  