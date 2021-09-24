pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
	string public name = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100;

	event TokenPurchased(

		address account,
		address token,
		uint amount,
		uint rate
		);

	event TokenSold(

		address account,
		address token,
		uint amount,
		uint rate
		);

	constructor(Token _token) public {
		token = _token;
	}
	function buyTokens() public payable{
		//amount of DApp tokens to buy
		uint tokenAmount = msg.value * rate;

		//require that EthSwap has enough tokens (not yet tested)
		require(token.balanceOf(address(this)) >= tokenAmount);

		//transfer the tokens to the user	
		token.transfer(msg.sender, tokenAmount);

		//emit an event
		emit TokenPurchased(msg.sender, address(token), tokenAmount, rate); 
	}	

	function sellTokens(uint _amount) public {
		//amount of ether  to sell
		uint etherAmount = _amount / rate;

		//require that EthSwap has enough Ether to purchase the tokens (not yet tested)
		require(address(this).balance >= etherAmount);

		//transfer the tokens to the user	
		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(etherAmount);
		
		//emit an event
		emit TokenSold(msg.sender, address(token), _amount, rate);
			
	}
}
