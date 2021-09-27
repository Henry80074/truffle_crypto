import React, { Component } from 'react'
import Web3 from 'web3'
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import './App.css'
import Navbar from './Navbar'
import Main from './Main'
import { ethers } from "ethers";
const web3 = window.ethereum

function toWei(eth) {
  return eth * 1000000000000000000
}

function fromWei(eth) {
  return eth / 1000000000000000000
} 

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockChainData()
  }

  async loadBlockChainData() {
    const ethereum = window.ethereum

    const accounts = await ethereum.request({method:'eth_accounts'});
    this.setState({ account: accounts[0]})

    const ethbalance = await provider.getBalance(this.state.account)
    let ethbalance_s = ethbalance.toString()
    this.setState({ ethbalance: ethbalance_s})
    
    // Load Token
    const network = await provider.getNetwork();
    const tokenData = Token.networks[network.chainId]

    if(tokenData) {
        const contractAddress = tokenData.address
        const token = new ethers.Contract(contractAddress, Token.abi, signer)
        let tokenBalance = await token.balanceOf(this.state.account)
        let tokenBalance_s = tokenBalance.toString()
        this.setState({tokenBalance: tokenBalance_s})
        this.setState({ token })
      }   
    else {
      window.alert('token contract not deployed to connected network')
    }

    const ethSwapData = EthSwap.networks[network.chainId]

    if(ethSwapData) {
        const ethSwapAddress = ethSwapData.address
        const ethSwap = new ethers.Contract(ethSwapAddress, EthSwap.abi, signer)
        this.setState({ethSwap})
      }   
    else {
      window.alert('EthSwap contract not deployed to connected network')
    }

    //Buy tokens
    
    //Sell tokens

    this.setState({loading: false})
  }

  async loadWeb3() {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
      // Request account access
      await window.ethereum.enable();
  }
      catch (error) {
      // User denied account access...
      console.error("User denied account access")
      }
    }
// Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
  }
 
  
  

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      ethbalance: '0',
      token: {},
      tokenBalance: '0',
      ethSwap: {},
      loading: true
    }
  }
  async buyTokens(etherAmount) {
    //let overrides = { value: etherAmount, from: '0xbb25098cba9db77c834bc817d3f9fb0d2c19d63c'}
    console.log(etherAmount)
    const network = await provider.getNetwork();
    const ethSwapData = EthSwap.networks[network.chainId]
    const ethSwapAddress = ethSwapData.address
    const ethSwap = new ethers.Contract(ethSwapAddress, EthSwap.abi, signer)
    const tx = await ethSwap.buyTokens({ value: ethers.utils.parseEther(etherAmount)})
    await tx.wait()
    console.log(tx)
      }

  async sellTokens(tokenAmount) {
    //let overrides = { value: etherAmount, from: '0xbb25098cba9db77c834bc817d3f9fb0d2c19d63c'}
    console.log(tokenAmount)
    const network = await provider.getNetwork();
    const tokenData = Token.networks[network.chainId]
    const contractAddress = tokenData.address
    const token = new ethers.Contract(contractAddress, Token.abi, signer)
    const ethSwapData = EthSwap.networks[network.chainId]
    const ethSwapAddress = ethSwapData.address
    const ethSwap = new ethers.Contract(ethSwapAddress, EthSwap.abi, signer)
    await token.approve(ethSwapAddress, tokenAmount)
    const tx1 = await ethSwap.sellTokens(tokenAmount)
    //console.log(typeof(v), v);
    await tx1.wait()
    console.log(tx1)
      }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">"Loading..."</p>
    } else { 
      content = <Main 
        ethbalance={this.state.ethbalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
      <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
          </div>
           {content}
        </div>
      </div>
    );
  }
}
export {toWei, fromWei};
export default App;