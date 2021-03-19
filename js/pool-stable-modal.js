function poolStableModal(f) {
  document.getElementById('btn-click').play();
  //If the wallet is connected then open the pool modal, else open metamask modal
  if (walletProvider !== undefined) {
    var poolName = $(f).attr('name');
    var tokenName = $(f).attr('data-token');
    $('#poolModal2').modal();
    $('.errorMessage').hide();
    $('#poolStableModalLabel').text(poolName);
    $('#stakeText').text('Staked ' + tokenName);
    //$('#poolTvl').text('Loading TVL...');
    $('#currentPoolToken').val(tokenName);
    //fetchTokenRewards();
    isAlreadyApproved();
    balanceOfStable();
    //fetchStableStaked();
    fetchStableEarned();
    //rewardsTvl();
  } else {
    $('#walletModal').modal();
  }
}

$('#poolModal2').on('hidden.bs.modal', function () {
  $('#tokenAmountStable').val('');
});
