function nftModal(e) {
    document.getElementById('btn-click').play();
    //If the wallet is connected then open the vending modal, else open metamask modal
    if (walletProvider !== undefined) {
      $('#nftModal').modal();
      pricePerUnit()
      $('#errorMessage').hide();
    } else {
      $('#walletModal').modal();
    }
  }
  