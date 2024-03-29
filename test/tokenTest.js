const Token = artifacts.require('Token');
const MultiSendableToken = artifacts.require("MultiSendableToken")
const BN = web3.utils.BN;

contract('Token', async (accounts) => {
    it('transfer', async () => {
        let token = await Token.new()
        let mintValue = web3.utils.toWei(new BN('1000000000'), 'ether')
        let from = accounts[0];
        let to = accounts[1];
        let amount = web3.utils.toWei(new BN('20'), 'ether')

        let balanceFrom = await token.balanceOf(from);

        assert.equal(balanceFrom.toString(), mintValue.toString());

        let balanceTo = await token.balanceOf(to);

        await token.transfer(to, amount, {
            from: from
        });

        let updateBalanceFrom = await token.balanceOf(from);
        let updateBalanceTo = await token.balanceOf(to);

        assert.equal(mintValue.sub(amount).toString(), updateBalanceFrom.toString());
        assert.equal(balanceTo.add(amount).toString(), updateBalanceTo.toString());
    });

    it('multi transfer', async () => {
        let token = await MultiSendableToken.new()
        let mintValue = web3.utils.toWei(new BN('1000000000'), 'ether')
        let from = accounts[0];
        let to = accounts[1];
        let to2 = accounts[2]
        let amount = web3.utils.toWei(new BN('500000000'), 'ether')

        let balanceFrom = await token.balanceOf(from);

        assert.equal(balanceFrom.toString(), mintValue.toString());

        let balanceTo = await token.balanceOf(to);

        let send1 = "0x" + web3.utils.padLeft(amount.toString('hex') + to.slice(2), 64)

        let send2 = "0x" + web3.utils.padLeft(amount.toString('hex') + to2.slice(2), 64)
        // 0x00000001158e460913d00000943Bef1Fb2F25C43Ab4a010ae835E936d1A34fE1

        const txs = [
            send1, send2
        ]

        // Should be 32bytes hex if calling from golang
        const inputDecimals = 18

        let logs = await token.multiTransferTightlyPacked(txs, inputDecimals, {
            from: from
        });

        let updateBalanceFrom = await token.balanceOf(from);
        let updateBalanceTo = await token.balanceOf(to);
        let updateBalanceTo2 = await token.balanceOf(to2);

        assert.equal(mintValue.sub(amount).sub(amount).toString(), updateBalanceFrom.toString());
        assert.equal(balanceTo.add(amount).toString(), updateBalanceTo.toString());
        assert.equal(amount.toString(), updateBalanceTo2.toString());

    });

})