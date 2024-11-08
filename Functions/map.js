function convertFollowToObject(followData) {
  const result = {};
  followData.data.forEach((set, key) => {
    result[key] = Array.from(set);
  });
  return result;
}


const Follow = {
  data: new Map([
    ["S", new Set(["$"])],
    ["S'", new Set(["$"])],
    ["B", new Set(["i", "$"])],
  ]),
};

const follows = convertFollowToObject(Follow);
console.log(follows);
