function nftModal(e) {
    //If the wallet is connected then open the vending modal, else open metamask modal
    if (walletProvider !== undefined) {
      document.getElementById('bongo').play();
      $('#shopModal').modal();
      pricePerUnit()
      $('#errorMessage').hide();
    } else {
      $('#walletModal').modal();
    }
  }
