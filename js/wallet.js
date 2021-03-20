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
async function balanceOfStable() {
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
        console.log(response)
        const tokenBalance = response / (10**6) // to edit
        console.log(tokenBalance)
        if (tokenBalance > 0) {
            $('#availableToStakeStable').text('Available: ' + tokenBalance.toString().substring(0,7))
        } else {
            $('#availableToStakeStable').text('Available:' + 0);
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
        if (tokenCode == 'ISLAETH') {
            console.log(tvl)
            $('#poolTvl').text('TVL: ' + tvl.toString().substring(0, 4) + ' UNILP');
        } else {
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
        }
        const myStake = await fetchTokensStaked()
        const totalDailyReward = getPoolRewardPerSecond()[tokenCode + 'LP'] * 60 * 60 * 24
        const myStakePercentage = myStake * 100 / tvl
        if (myStakePercentage > 0) {
            const myDailyRewards = totalDailyReward / 100 *  myStakePercentage;
            $('#dailyRewards').append(myDailyRewards.toString().substr(0, 8));
          } else {
            $('#dailyRewards').append(0);
          }
    } catch (error) {
        console.log(error);
    }
    return
}

// data -> '0xf13ef83a' function name (chargePlug(uint256))
async function stakeStable() {
    const tokenAmount = $("#tokenAmountStable").val();
    if (tokenAmount > 0) {
        const usdcDecimals = 6
        const tokenAmountDecimals = BigInt(tokenAmount * 10 ** usdcDecimals)
        const padding = 32 * 2
        const hexAmount = tokenAmountDecimals.toString(16);
        const zeroToAdd = padding - hexAmount.length
        const zeros = '0'.repeat(zeroToAdd)
        const dataHex = '0xf13ef83a' + zeros + hexAmount
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
      $('.errorMessage').show(1).delay(3000).hide(1);
    }
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
      $('.errorMessage').show(1).delay(3000).hide(1);
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
    $('.errorMessage').show(1).delay(3000).hide(1);
  }
}

async function withdrawOpt1() {
    withdrawOpt(100)
}

async function withdrawOpt2() {
    withdrawOpt(50)
}

async function withdrawOpt3() {
    withdrawOpt(0)
}

// data -> '0x978ac3aa' dischargePlug(uint256))
async function withdrawOpt(plugPercentage) {
    fetchTxInfos();
    const padding = 32 * 2
    const hexAmount = plugPercentage.toString(16);
    const zeroToAdd = padding - hexAmount.length
    const zeros = '0'.repeat(zeroToAdd)
    const dataHex = '0x978ac3aa' + zeros + hexAmount
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
}

// data -> '0xb121500a' function  name (usersTokenWant())
async function TVLStable() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0xb121500a'
                }
            ]
        })
        var tvl = parseInt(response)
        const usdcDecimals = 6
        if (tvl > 0) {
          $('#tvl').text('Pool TVL:' + tvl / (10** usdcDecimals))
        } else {
          $('#tvl').text(0);
        }
    } catch (error) {
        console.log(error);
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

// data -> '0xc134a215' function  name (tokenWantAmounts(address))
async function fetchStableStaked() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0xc134a215000000000000000000000000' + accounts[0].substring(2)
                }
            ]
        })
        var amountStaked = response
        if (amountStaked > 0) {
          $('#poolStakedStable').text(amountStaked / (10**6))
        } else {
          $('#poolStakedStable').text(0);
        }
    } catch (error) {
        console.log(error);
    }
    return amountStaked
}

// data -> '0xcb005742' function  name (tokenStrategyAmounts(address))
async function fetchStrategyStaked() {
    fetchTxInfos()
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: lpPoolAddress,
                    from: accounts[0],
                    data: '0xcb005742000000000000000000000000' + accounts[0].substring(2)
                }
            ]
        })
        return response
    } catch (error) {
        console.log(error);
    }
}

// data -> '0x29272b1a' function name (getRedeemPrice(address, address))
async function fetchStableEarned() {
    const stableStaked = await fetchStableStaked();
    const strategyStaked = parseInt(await fetchStrategyStaked());
    const idleTokenHelper = '0x04Ce60ed10F6D2CfF3AA015fc7b950D13c113be5';
    const idleUSDCYield = '0x5274891bEC421B39D23760c04A6755eCB444797C'
    const zeroA = '000000000000000000000000'
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: idleTokenHelper,
                    from: accounts[0],
                    data: '0x095ea7b3' + zeroA + idleUSDCYield +   zeroA + lpPoolAddress.substring(2),
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0xf4240'
                }
            ]
        })
        const tokenPrice = parseInt(response)
        const usdcDecimals = 6;
        const tokenEarned = (tokenPrice * strategyStaked / (10**18)) - stableStaked
        var amountEarnedDecimal = 0
        if (tokenEarned > 0) {
          amountEarnedDecimal = tokenEarned / 10**usdcDecimals
        }
        if (amountEarnedDecimal > 0) {
            $('#poolRewardStable').text(amountEarnedDecimal.toString().substring(0,4));
            $('#poolRewardStableW').text(amountEarnedDecimal.toString().substring(0,4));
          } else {
            $('#poolRewardStable').text(0);
            $('#poolRewardStableW').text(0);
          }
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
          $('#farmingRewards').text(amountEarned.toString().substring(0,7));
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
            $('.btn_approve').hide();
            $('.btn_stake').show();
        } else {
            console.log('not approved yet')
            $('.btn_approve').show();
            $('.btn_stake').hide();
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
    //tokenId = $('#token-id').val()
}

function getSeason1Tokens() {
    return {
        CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        SNX: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
        SUSHI: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
        AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
        LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        ISLAND: '0x20a68F9e34076b2dc15ce726d7eEbB83b694702d',
        ISLAETH: '0x8bd78ad73eE85dfc1395a0cE3E90ef061Ae6017C',
        USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        DAI: '',
        USDT: ''

    }
}

function getSeason1Pools() {
    return {
        CRVLP: '0x99Cf79d898e306E382F70c6b63EbcE8CA0610cc1',
        SNXLP: '0x30353c2b2536223600054DADC79C7283D6111314',
        SUSHILP: '0x50DbD9f08798D3A2Ea542E64764E3334fE2553e1',
        AAVELP: '0xe27E43e3cde491A28Cf1DF4b6cbF6e4edF8e6298',
        LINKLP: '0xCe4d7780d760E5D6F3F2b436756D2507478feDB9',
        ISLAETHLP: '0x9Eb44E6FC22cD22bD62d95cFD637353E3dBEc39C',
        USDCLP: '0xC723C6Be9cD520A50Faa2C76aC5BCed96bA8E2f9',
        DAILP: '',
        USDTLP: ''
    }
}

function getCoingeckoToken() {
    return {
        CRV: 'curve-dao-token',
        SUSHI: 'sushi',
        SNX: 'havven',
        AAVE: 'aave',
        LINK: 'chainlink'
    }
}

function getPoolRewardPerSecond() {
    return {
        CRVLP: 0.03858,
        SNXLP: 0.03858,
        SUSHILP: 0.03858,
        AAVELP: 0.03858,
        LINKLP: 0.06430,
        ISLAETHLP: 0.05144
    }
}

$('#metamaskButton').on('click', function(event) {
    event.preventDefault();
    connectMetamaskWallet();
})
