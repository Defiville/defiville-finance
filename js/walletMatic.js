var walletProvider;
var accounts;
var tokenCode;
var tokenAddress;
var lpPoolAddress;
var gasPrice;
var gasPriceGWei;

async function getMetamaskWallet() {
    try {
        walletProvider = await window.ethereum
        accounts = await walletProvider.request({ method: 'eth_requestAccounts' })
        var addressStart = accounts[0].slice(0,6);
        var addressEnd = accounts[0].slice(38,42);
        document.getElementById('con-wallet').textContent = addressStart + "..." + addressEnd;
        checkNetwork()
        walletProvider.on('chainChanged', () => {
            checkNetwork()
        })
        walletProvider.on('accountsChanged', (accounts) => {
            if (accounts.length == 0) {
                console.log('account changed')
            }
        })
    }
    catch (error) {
        console.log(error);
    }
    if (walletProvider.networkVersion == 137) {
        await balanceOfMatic()
    }

}

function checkNetwork() {
    console.log(walletProvider.networkVersion)
    if (walletProvider.networkVersion == 137) {
        // hide banner
        $('#networkBanner').hide();
        $('#tipButton').show();
        $('#tipRadioButton').show();
        $('.errorMessage').hide();
    } else {
        // show banner
        $('#networkBanner').show();
        $('#tipButton').hide();
        $('#tipRadioButton').hide();
        $('.errorMessage').text('Please select the correct network');
    }
}

// data -> '0xfd64b2f1' function name (tipArtist(uint256,address,uint256))
async function tipArtist() {
  if (walletProvider !== undefined) {
    const artist = $('#artistSelection option:selected').val();
    const artistTip = $('#artistTip').val();
    if (artist == 'Select artist' || artistTip == '') {
      $('.errorMessage').text('Please select an artist and a tip amount').show(1).delay(3000).hide(1);
    } else {
        const radioTips = '0xb2B8Ab3457CC941d5a64B3e5a0289db0cF254559'
        const zeroPadding = 32 * 2

        const artistId = getArtistsID()[artist]
        const idHex = artistId.toString(16)

        const tipHex = (parseInt(artistTip) * 10**18).toString(16)

        const idZero = zeroPadding - idHex.length
        const tipZero = zeroPadding - tipHex.length

        const idZeros = '0'.repeat(idZero)
        const tipZeros = '0'.repeat(tipZero)

        const tokenAddress = getMaticTokens()['XDAI']
        const tokenZeros = '000000000000000000000000'

        const dataHex = '0xfd64b2f1' + idZeros + idHex + tokenZeros + tokenAddress.substring(2) + tipZeros + tipHex
        console.log(artistTip)
        console.log(tipHex)
        try {
            const transactionHash = await walletProvider.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        to: radioTips,
                        from: accounts[0],
                        data: dataHex,
                        value: tipHex,
                        gas: '0x493e0',
                    }
                ]
            })
        } catch (error) {
            console.log(error);
        }
    }
  } else {
    $('#walletModal').modal();
  }
}

// data -> '0x26f5fda2' function name (tipRadio(address,uint256))
async function tipRadio() {
    if (walletProvider !== undefined) {
      const radioTip = $('#radioTip').val();
      if (radioTip == '') {
        $('.errorMessage').text('Please select a tip amount').show(1).delay(3000).hide(1);
      } else {
        const tokenAddress = getMaticTokens()['XDAI']
        const radioTips = '0xb2B8Ab3457CC941d5a64B3e5a0289db0cF254559'

        const zeroPadding = 32 * 2
        const tipHex = (parseInt(radioTip) * 10**18).toString(16)
        const tipZero = zeroPadding - tipHex.length
        const tipZeros = '0'.repeat(tipZero)
        try {
            const transactionHash = await walletProvider.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        to: radioTips,
                        from: accounts[0],
                        data: '0x26f5fda2000000000000000000000000' + tokenAddress.substring(2) + tipZeros + tipHex,
                        value: tipHex,
                        gas: '0x493e0',
                    }
                ]
            })
        } catch (error) {
            console.log(error);
        }
      }
    } else {
      $('#walletModal').modal();
    }
  }

// data -> '0x095ea7b3' function name (approve(address,uint256))
// -> '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' max amount to approve
async function approve() {
    try {
        const transactionHash = await walletProvider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    to: tokenAddress,
                    from: accounts[0],
                    data: '0x095ea7b3000000000000000000000000' + lpPoolAddress.substring(2) + 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0x493e0'
                }
            ]
        })
    } catch (error) {
        console.log(error);
    }
}

async function balanceOfMatic() {
    try {
        const response = await walletProvider.request({
            method: 'eth_getBalance',
            params: [accounts[0]]
        })
        const tokenBalance = response / (10**18);
        if (tokenBalance > 0) {
            $('#maticBalance').append(tokenBalance.toString().substring(0,7));
        } else {
            $('#maticBalance').text(0 + ' MATIC');
        }
    } catch (error) {
        console.log(error);
    }
}

// data -> '0xdd62ed3e' function name (allowance(address,address))
async function isAlreadyApproved(){
    const zeroPadding = '000000000000000000000000'
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: tokenAddress,
                    from: accounts[0],
                    data: '0xdd62ed3e'
                }
            ]
        })
        if (response > 0) {
            console.log('already approved the token')
        } else {
            console.log('not approved yet')
        }
    } catch (error) {
        console.log(error);
    }
}

function getMaticTokens() {
    return {
        XDAI: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    }
}

function getArtistsID() {
    return {
        rehab: 0,
        rac: 1,
        threelau: 2,
        catalog: 3,
        daorecords: 4

    }
}

function getTokenDecimals() {
    return {
        XDAI: '18'
    }
}

$('#metamaskButton').on('click', function(event) {
    event.preventDefault();
    connectMetamaskWallet();
})
