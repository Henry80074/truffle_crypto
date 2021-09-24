const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

const chaiAsPromised = require('chai-as-promised')
require('chai')
	.use(chaiAsPromised)
	.should()

	function tokens(n) {
		return web3.utils.toWei(n, 'ether');
	}


contract('EthSwap', ([deployer, investor]) => {

	let token, ethSwap

	before(async () => {
		token = await Token.new()
		ethSwap = await EthSwap.new(token.address)
		// transfer all tokens to EthSwap (1 million)
		await token.transfer(ethSwap.address, tokens('1000000'))
	})

	describe('Token deployment', async () => {
		it('contact has a name', async () => {
			const name  = await token.name()
			assert.equal(name, 'DApp Token')
		})	
	})

	describe('EthSwap deployment', async () => {
		it('contract has a name', async () => {
			const name  = await ethSwap.name()
			assert.equal(name,'EthSwap Instant Exchange')
		})	
		it('contract has tokens', async () => {
			let balance = await token.balanceOf(ethSwap.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})
	describe ('buyToken()', async () => {
		let result 

	  before(async () => {
	  	//purchase tokens before each example
		result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
	})
		it('allows user to purchase tokens from ethSwap', async () => {
			//check investor token balance after purchase
			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('100'))
			// check ethSwap balance
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('999900'))
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

			const event = result.logs[0].args

			assert.equal(event.account, investor)
		    assert.equal(event.token, token.address)
		    assert.equal(event.amount.toString(), tokens('100').toString())
		    assert.equal(event.rate.toString(), '100')

			
		})
	})

	describe ('sellTokens()', async () => {
		let result 

	 	before(async () => {
		  	await token.approve(ethSwap.address, tokens('100'), { from: investor})
			result = await ethSwap.sellTokens(tokens('100'), {from: investor})
			})
		it('allows user to sell tokens to ethSwap for a fixed price', async () => {

			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('0'))
			// check ethSwap balance
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('1000000'))
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'Ether'))

			//check logs to ensure event emitted with the correct data
			const event = result.logs[0].args

			assert.equal(event.account, investor)
		    assert.equal(event.token, token.address)
		    assert.equal(event.amount.toString(), tokens('100').toString())
		    assert.equal(event.rate.toString(), '100')

		    //failure: can't sell more token than the user possesses - this is tested for in transferFrom function



		
		})
	})
})