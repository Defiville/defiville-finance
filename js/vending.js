const vendingAddress = '0xA0Fd0f02797a9f38DF55Fe6ba0cF870e57D1A0e5'

// data -> '0xb5f522f7' function name (sales(uint256))
async function pricePerUnit() {
    const saleId = 1
    //fetchSaleId()
    const padding = 32 * 2
    const hexAmount = saleId.toString(16);
    const zeroToAdd = padding - hexAmount.length
    const zeros = '0'.repeat(zeroToAdd)
    const dataHex = '0xb5f522f7' + zeros + hexAmount
    try {
        const response = await walletProvider.request({
            method: 'eth_call',
            params: [
                {
                    to: vendingAddress,
                    from: accounts[0],
                    data: dataHex,
                    // gasPrice: gasPriceGWei.toString(16),
                    // gas: '0x493e0'
                }
            ]
        })
        const sale = response
        //const saleCreator = sale.substring(2, 66)
        //const saleNFT = sale.substring(66, 130).toString(16)
        const saleTokenId = parseInt('0x' + sale.substring(130, 194).toString(16))
        const saleAmountLeft = parseInt('0x' + sale.substring(194, 258).toString(16))
        //const saleTokenWant = sale.substring(258, 322).toString(16)
        const salePricePerUnitWithDecimals = parseInt('0x' + sale.substring(322, 386).toString(16))
        const salePricePerUnit = salePricePerUnitWithDecimals / 10 ** 18
        $('#slot0salePrice').text('ETH ' + salePricePerUnit)
        $('#saleAmountLeft').text(saleAmountLeft + '/5 LEFT')
        //$('#saleImage').text()

    } catch (error) {
        console.log(error);
    }
}

// data -> '0x1d85bf03' function name (buyNFT(uint256, uint256))
async function buyNFT() {
    const saleId = 1
    //fetchTxInfos()
    // hardcoded to 1 for now
    const nftAmount = 1
    const padding = 32 * 2
    const hexSaleId = saleId.toString(16);
    const hexAmount = nftAmount.toString(16);
    const zeroToAddSaleId = padding - hexSaleId.length
    const zeroToAddAmount = padding - hexAmount.length
    const zerosSaleId = '0'.repeat(zeroToAddSaleId)
    const zerosAmount = '0'.repeat(zeroToAddAmount)

    const dataHexSaleId = zerosSaleId + hexSaleId
    const dataHexAmount = zerosAmount + hexAmount

    const salePricePerUnit = $('#slot0salePrice').text()
    // Delete "ETH " text
    const totalSalePrice = salePricePerUnit.substring(4) * nftAmount
    //const totalSalePriceInDecimals = BigInt(totalSalePrice * 10 ** 18)
    const tempValue = BigInt(50000000000000000)
    const totalSalePriceHex = tempValue.toString(16)
    try {
        const transactionHash = await walletProvider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    to: vendingAddress,
                    from: accounts[0],
                    data: '0x1d85bf03' + dataHexSaleId + dataHexAmount,
                    value: totalSalePriceHex,
                    gas: '0x186a0' // 100K 
                    // gasPrice: gasPriceGWei.toString(16),
                }
            ]
        })
    } catch (error) {
        console.log(error);
    }
}
