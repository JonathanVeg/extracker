export function giveMeSpaceInLog(n = 10) {
  let l = '';
  for (let i = 0; i < n; i++) l += '\n';

  console.log(l);
}

export function sortArrayByKey(arr, key, reverse = false) {
  arr.sort((a, b) => {
    if (a[key] < b[key]) return reverse ? 1 : -1;
    if (a[key] > b[key]) return reverse ? -1 : 1;
    return 0;
  });

  return arr;
}
