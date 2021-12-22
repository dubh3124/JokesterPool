function calculateAverage(array) {
  var total = 0;
  var count = 0;

  array.forEach(function(item, index) {
      total += item.toNumber();
      count++;
  });

  return total / count;
}