$(document).ready(function() {
  var gasPrices = $('#gas-med');
  var gasfast = $('#gasfast');
  var gasaverage = $('#gasaverage');
  var gaslow = $('#gaslow');
  $.ajax({
  url: "https://ethgasstation.info/api/ethgasAPI.json?",
  type: 'GET',
  dataType: 'json', // added data type
  success: function(res) {
      gasPrices.html(res['average'].toString().slice(0,-1));
      gasfast.html(res['fast'].toString().slice(0,-1));
      gasaverage.html(res['average'].toString().slice(0,-1));
      gaslow.html(res['safeLow'].toString().slice(0,-1));
  }
});
})
