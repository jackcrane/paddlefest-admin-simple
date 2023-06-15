export const getDifferentKeys = (obj1, obj2) => {
  let keys = [];
  for (var i in obj1) {
    if (obj1.hasOwnProperty(i)) {
      if (!obj2.hasOwnProperty(i)) keys.push(i);
      if (obj1[i] != obj2[i]) keys.push(i);
    }
  }
  for (var i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      if (!obj1.hasOwnProperty(i)) keys.push(i);
      if (obj1[i] != obj2[i]) keys.push(i);
    }
  }
  return [...new Set(keys)];
};
