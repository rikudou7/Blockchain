const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(','): [];
//In the command line, we might do something like this:
// > HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
//This would first choose the HTTP_PORT environment variable to be 3002. The P2P_PORT variable to be 5003. The PEERS variable to be (blah blah)
//Note that the above example would represent two peers being connected to the server, one peer using websocket 5001 and one using 5002
//ws://localhost:5001 expresses that the websocket being used is 5001. This is called a websocket address.

const MESSAGE_TYPES = {
	chain: 'CHAIN',
	transaction: 'TRANSACTION',
	clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2pServer {
	constructor(blockchain, transactionPool) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.sockets = [];
	}
	
	listen() {
		const server = new Websocket.Server({port: P2P_PORT});
		server.on('connection', socket => this.connectSocket(socket)); //The server turns on, listening for connection events. When a connection event occurs, 
		                                                               //the variable socket declares itself and passes itself to the connectSocket method
																	   
		this.connectToPeers();															   
		console.log(`Listening for peer-to-peer communications on: ${P2P_PORT}`);
	}
	
	connectSocket(socket) {
		this.sockets.push(socket);
		console.log('Socket connected');
		this.messageHandler(socket);
		this.sendChain(socket);
	}
	
	connectToPeers() {
		console.log("The number of entries in the peers array is " + peers.length);
		peers.forEach(peer => {
			const socket = new Websocket(peer);
			socket.on('open', () => this.connectSocket(socket));
		});
	}
	
	messageHandler(socket) {
		socket.on('message', message => {
			const data = JSON.parse(message);
			
			switch(data.type) {
				case MESSAGE_TYPES.chain:
				  this.blockchain.replaceChain(data.chain);
				  break;
				  
				case MESSAGE_TYPES.transaction:
				  this.transactionPool.updateOrAddTransaction(data.transaction);
				  break;
				  
			    case MESSAGE_TYPES.clear_transactions:
				  this.transactionPool.clear();
				  break;
			}
			
		});
		
	}
	
	sendChain(socket) {
		socket.send(JSON.stringify({type: MESSAGE_TYPES.chain, chain: this.blockchain.chain}));
		
	}
	
	sendTransaction(socket, transaction) {
		socket.send(JSON.stringify({type: MESSAGE_TYPES.transaction, transaction}));
	}
	
	syncChains() {
		this.sockets.forEach(socket => this.sendChain(socket));
	}
	
	broadcastTransaction(transaction) {
		this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
	}
	
	broadcastClearTransactions() {
		this.sockets.forEach(socket => socket.send(JSON.stringify({type: MESSAGE_TYPES.clear_transactions})));
	}
}

module.exports = P2pServer;