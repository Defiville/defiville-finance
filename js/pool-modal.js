function poolModal(e) {
  document.getElementById('btn-click').play();
  var poolName = $(e).attr('name');
  var tokenName = $(e).attr('data-token');
  $('#poolModal').modal();
  $('#errorMessage').hide();
  $('#poolModalLabel').text(poolName);
  $('#stakeText').text('Stake ' + tokenName);
  $('#currentPoolToken').val(tokenName);
  fetchTokensStaked()
  fetchTokenRewards()
  isAlreadyApproved()
}

$('#poolModal').on('hidden.bs.modal', function () {
  $('#tokenAmount').val('');
});
