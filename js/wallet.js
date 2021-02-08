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
        await balanceOfIsla()
        walletProvider.on('chainChanged', () => {
            console.log('chain changed')
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
}

// data -> '0x095ea7b3' function name (approve(address,uint256))
// -> '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' max amount to approve
async function approve() {
    fetchTxInfos()
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

// data -> '0x70a08231' function name (balanceOf(address))
async function balanceOf() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: tokenAddress,
                    from: accounts[0],
                    data: '0x70a08231000000000000000000000000' + accounts[0].substring(2),
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0x493e0'
                }
            ]
        })
        const tokenBalance = response / (10**18)
        if (tokenBalance > 0) {
            $('#availableToStake').append(tokenBalance.toString().substring(0,7))
          } else {
            $('#availableToStake').text('Available:' + 0);
          }
    } catch (error) {
        console.log(error);
    }
}

// data -> '0x70a08231' function name (balanceOf(address))
async function balanceOfIsla() {
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: getSeason1Tokens()["ISLAND"],
                    from: accounts[0],
                    data: '0x70a08231000000000000000000000000' + accounts[0].substring(2),
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0x493e0'
                }
            ]
        })
        const tokenBalance = response / (10**18)
        $('#islaBalance').text(tokenBalance.toFixed(2) + " ISLA")
        console.log(tokenBalance)
    } catch (error) {
        console.log(error);
    }
}

// data -> '0x18160ddd' function name (totalSupply())
async function rewardsTvl() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0x18160ddd',
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0x493e0'
                }
            ]
        })
        var tvl = response / (10**18);
        var tokenId = getCoingeckoToken()[tokenCode]
        var priceTvl = 'https://api.coingecko.com/api/v3/simple/price?ids=' + tokenId + '&vs_currencies=usd';
        $.ajax({
            url: priceTvl,
            contentType: "application/json",
            dataType: 'json',
            success: function(result){
                var unitPrice = result[tokenId]['usd'] * tvl;
                $('#poolTvl').text('TVL: $ ' + unitPrice.toFixed(2))
            },
            error: function(errorMessage){
          }
        })
        console.log(tvl.toString().substr(0, 8));
        const poolRewardPerSecond = 0.03858;
        const myStake = await fetchTokensStaked()
        const totalDailyReward = poolRewardPerSecond * 60 * 60 * 24
        const myStakePercentage = myStake * 100 / tvl
        const myDailyRewards = totalDailyReward / 100 *  myStakePercentage;
        $('#dailyRewards').append(myDailyRewards.toString().substr(0, 8));

    } catch (error) {
        console.log(error);
    }
    return tvl
}

// data -> '0xa694fc3a' function name (stake(uint256))
async function stake() {
    const tokenAmount = $("#tokenAmount").val();
    if (tokenAmount > 0) {
        const islandDecimals = 18
        const tokenAmountDecimals = BigInt(tokenAmount * 10 ** islandDecimals)
        const padding = 32 * 2
        const hexAmount = tokenAmountDecimals.toString(16);
        const zeroToAdd = padding - hexAmount.length
        const zeros = '0'.repeat(zeroToAdd)
        const dataHex = '0xa694fc3a' + zeros + hexAmount
        fetchTxInfos();
        try {
            const transactionHash = await walletProvider.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        to: lpPoolAddress,
                        from: accounts[0],
                        data: dataHex,
                        // gasPrice: gasPriceGWei.toString(16),
                        // gas: '0x493e0'
                    }
                ]
            })
        } catch (error) {
            console.log(error);
        }
    } else {
      $('#errorMessage').show(1).delay(3000).hide(1);
    }
}

// data -> '0x2e1a7d4d' function name (withdraw(uint256))
async function withdraw() {
  const tokenAmount = $("#tokenAmount").val();
  if (tokenAmount > 0) {
    const islandDecimals = 18
    const tokenAmountDecimals = BigInt(tokenAmount * 10 ** islandDecimals)
    const padding = 32 * 2
    const hexAmount = tokenAmountDecimals.toString(16);
    const zeroToAdd = padding - hexAmount.length
    const zeros = '0'.repeat(zeroToAdd)
    const dataHex = '0x2e1a7d4d' + zeros + hexAmount
    fetchTxInfos()
    try {
        const transactionHash = await walletProvider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: dataHex,
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0xf4240'
                }
            ]
        })
    } catch (error) {
        console.log(error);
    }
  } else {
    $('#errorMessage').show(1).delay(3000).hide(1);
  }
}

// data -> '0x3d18b912' function name (getReward())
async function harvest() {
    fetchTxInfos()
    try {
        const transactionHash = await walletProvider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0x3d18b912',
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0xf4240'
                }

            ]
        })
    } catch (error) {
        console.log(error);
    }
}

// data -> '0xe9fad8ee' function name (exit())
async function harvestAndUnstake() {
    fetchTxInfos()
    try {
        const transactionHash = await walletProvider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0xe9fad8ee',
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0xf4240'
                }
            ]
        })
    } catch (error) {
        console.log(error);
    }
}

// data -> '0x70a08231' function  name (balancedOf(address))
async function fetchTokensStaked() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0x70a08231000000000000000000000000' + accounts[0].substring(2)
                }
            ]
        })
        var amountStaked = response / (10**18)
        if (amountStaked > 0) {
          $('#poolStaked').text(amountStaked)
        } else {
          $('#poolStaked').text(0);
        }
    } catch (error) {
        console.log(error);
    }
    return amountStaked
}

// data -> '0x008cc262' function name (earned(address))
async function fetchTokenRewards() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0x008cc262000000000000000000000000' + accounts[0].substring(2)
                }
            ]
        })
        const amountEarned = response / (10**18)
        if (amountEarned > 0) {
          $('#poolReward').text(amountEarned.toString().substring(0,7));
        } else {
          $('#poolReward').text(0);
        }
    } catch (error) {
        console.log(error);
    }
}

// data -> '0xdd62ed3e' function name (allowance(address,address))
async function isAlreadyApproved(){
    fetchTxInfos()
    const zeroPadding = '000000000000000000000000'
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: tokenAddress,
                    from: accounts[0],
                    data: '0xdd62ed3e' + zeroPadding + accounts[0].substring(2) + zeroPadding + lpPoolAddress.substring(2)
                }
            ]
        })
        if (response > 0) {
            console.log('already approved the token')
            $('#btnApprove').hide();
            $('#btnStake').show();
        } else {
            console.log('not approved yet')
            $('#btnApprove').show();
            $('#btnStake').hide();
        }
    } catch (error) {
        console.log(error);
    }
}

function fetchTxInfos() {
    tokenCode = $('#currentPoolToken').val()
    tokenAddress = getSeason1Tokens()[tokenCode]
    lpPoolAddress = getSeason1Pools()[tokenCode + "LP"]
    gasPrice = $('#gas-med').html();
    gasPriceGWei = gasPrice * 10 ** 8;
}

function getSeason1Tokens() {
    return {
        CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
        SUSHI: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        // MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        // YFI: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
        // COMP: '0xc00e94cb662c3520282e6f5717214004a7f26888',
        AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        // LINK: '0x514910771af9ca656af840dff83e8264ecf986ca',
        ISLAND: '0x20a68F9e34076b2dc15ce726d7eEbB83b694702d',
    }
}

function getSeason1Pools() {
    return {
        CRVLP: '0x99Cf79d898e306E382F70c6b63EbcE8CA0610cc1',
        SNXLP: '0x30353c2b2536223600054DADC79C7283D6111314',
        SUSHILP: '0x50DbD9f08798D3A2Ea542E64764E3334fE2553e1',
        // MKRLP: '0x514910771af9ca656af840dff83e8264ecf986ca',
        // YFILP: '0x514910771af9ca656af840dff83e8264ecf986ca',
        // COMPLP: '0x514910771af9ca656af840dff83e8264ecf986ca',
        AAVELP: '0xe27E43e3cde491A28Cf1DF4b6cbF6e4edF8e6298',
        // LINKLP: '0x514910771af9ca656af840dff83e8264ecf986ca',
    }
}

function getCoingeckoToken() {
    return {
        CRV: 'curve-dao-token',
        SUSHI: 'sushi',
        SNX: 'havven',
        AAVE: 'aave'
    }
}

$('#metamaskButton').on('click', function(event) {
    event.preventDefault();
    connectMetamaskWallet();
})
