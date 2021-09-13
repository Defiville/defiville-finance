function maticModal(e) {
  document.getElementById('btn-click').play();
  //If the wallet is connected then open the pool modal, else open metamask modal
  if (walletProvider !== undefined && walletProvider.networkVersion == 137) {
    $('#fundingModal').modal();
    getNFTRareLeft();
    getNFTCommonLeft();
  } else {
    $('#walletModal').modal();
  }
}

$('#poolModal').on('hidden.bs.modal', function () {
  $('#tokenAmount').val('');
});
