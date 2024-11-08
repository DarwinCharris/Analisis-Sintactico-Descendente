function convertFirstToArray(input) {
  let result = [];
  for (let nonTerminal in input) {
    result.push([nonTerminal, ...Array.from(input[nonTerminal])]);
  }
  return result;
}
const input = {
  S: new Set(["("]),
  "S'": new Set(["i", "&"]),
  B: new Set(["(", "&"]),
};
console.log(convertFirstToArray(input));



function convertFollowToArray(input) {
  let result = [];
  input.data.forEach((set, nonTerminal) => {
    result.push([nonTerminal, ...Array.from(set)]);
  });
  return result;
}

const follow = {
  data: new Map([
    ["S", new Set(["$"])],
    ["S'", new Set(["$"])],
    ["B", new Set(["i", "$"])],
  ]),
};
console.log(convertFollowToArray(follow));
