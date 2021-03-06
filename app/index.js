const express = require('express');
const bodyParser = require('body-parser');
const BlockChain = require('../blockchain');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');


const app = express();
app.use(bodyParser.json());
const bc = new BlockChain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

app.get('/blocks', (req, res) => {
	res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
	res.json(tp.transactions);
});

app.post('/mine', (req, res) => {
	const block = bc.addBlockToChain(req.body.data);
	console.log(`A new block was added: ${block.ToString()}`);
	p2pServer.syncChains();
	res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
	const {recipient, amount} = req.body;
	const transaction = wallet.createTransaction(recipient, amount, bc, tp);
	p2pServer.broadcastTransaction(transaction);
	res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
	res.json({publicKey: wallet.publicKey});
});

app.get('/mine-transactions', (req, res) => {
	const block = miner.mine();
	console.log(`New block added: ${block.ToString()}`);
	res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();