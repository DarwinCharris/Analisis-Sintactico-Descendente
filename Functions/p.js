const grammar = {
  rightPart: [
    { NTerm: "S", productions: ["BS'"] },
    { NTerm: "S'", productions: ["id", "&"] },
    { NTerm: "B", productions: ["(id)i", "&"] },
  ],
};
console.log(grammar.rightPart[1].productions[1][0]);
