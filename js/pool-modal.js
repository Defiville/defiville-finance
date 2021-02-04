function poolModal(e) {
  document.getElementById('btn-click').play();
  //If the wallet is connected then open the pool modal, else open metamask modal
  if (walletProvider !== undefined) {
    var poolName = $(e).attr('name');
    var tokenName = $(e).attr('data-token');
    $('#poolModal').modal();
    $('#errorMessage').hide();
    $('#poolModalLabel').text(poolName);
    $('#stakeText').text('Staked ' + tokenName);
    $('#poolTvl').text('Loading TVL');
    $('#availableToStake').text('Available:');
    $('#dailyRewards').text('Daily rewards:')
    $('#currentPoolToken').val(tokenName);
    fetchTokensStaked();
    fetchTokenRewards();
    isAlreadyApproved();
    balanceOf();
    rewardsTvl();
  } else {
    $('#walletModal').modal();
  }
}

$('#poolModal').on('hidden.bs.modal', function () {
  $('#tokenAmount').val('');
});
