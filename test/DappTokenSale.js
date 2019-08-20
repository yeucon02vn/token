var DappToken = artifacts.require('./DappToken.sol');
var DappTokenSale = artifacts.require('./DappTokenSale.sol');

contract('DappTokenSale', accounts => {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;
    var numberOfTokens;

    it('initializes the contract with the correct values', function() {
        return DappTokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(address => {
            assert.notEqual(address, 0x0, 'has contract correct');
            return tokenSaleInstance.tokenContract();
        }).then(address => {
            assert.notEqual(address, 0x0, 'has token contract correct');
            return tokenSaleInstance.tokenPrice();
        }).then(price => {
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('facilitates token buying', function() {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(instance => {
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(receipt => {
            numberOfTokens = 10;
            
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice});

        }).then(receipt => {
            assert.equal(receipt.logs.length, 1,'trigger one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account the purchased the token');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, ' logs the number of token purchased');
            return tokenSaleInstance.tokensSold();
        }).then(amount => {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of the sold');
            return tokenInstance.balanceOf(buyer);
        }).then(balance => {
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(balance => {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "msg.value must equal number of tokens in wei");
            return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "cannot purchase more tokens than available");
        });
    });


    it('ends token sale', function() {
        return DappToken.deployed().then(instance => {
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0,"must be admin to end sale");
            return tokenSaleInstance.endSale({ from: admin });
        }).then(receipt => {
            return tokenInstance.balanceOf(admin);
        }).then(async balance => {
            assert.equal(balance.toNumber(), 999990, 'return all unsold dapp tokens to admin');
            balance = await web3.eth.getBalance(tokenSaleInstance.address);
            assert.equal(balance,0);
        });
    });
})