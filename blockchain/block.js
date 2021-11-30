const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');
class Block {
	constructor(timestamp, lasthash, hash, data, nonce, difficulty) {
		this.timestamp = timestamp; //in milliseconds
		this.lasthash = lasthash;
		this.hash = hash;
		this.data = data;
		this.nonce = nonce;
		this.difficulty = difficulty || DIFFICULTY;
	}
	ToString() {
		return `Block -
		  Timestamp  : ${this.timestamp}
		  Last Hash  : ${this.lasthash}
		  Hash       : ${this.hash}
		  Nonce      : ${this.nonce}
		  Difficulty : ${this.difficulty}
		  Data       : ${this.data}`;
	}
	
	static genesis() {
		return new this("Genesis time", "----", "0", [], 0, DIFFICULTY);
	}
	
	static mineBlock(lastBlock, data) {
		let hash, timestamp;
		const lasthash = lastBlock.hash;
		let { difficulty } = lastBlock; //This is a local difficulty variable that is assigned as being the difficulty value in the lastblock. ES6 Destruction Syntax
		let nonce = 0;
		do {
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty(lastBlock, timestamp);
			hash = Block.hash(timestamp, lasthash, data, nonce, difficulty);
		} while(hash.substring(0, difficulty) !== '0'.repeat(difficulty))
		
		return new this(timestamp, lasthash, hash, data, nonce, difficulty); 
	}
	
	static hash(timestamp, lasthash, data, nonce, difficulty) {
		return ChainUtil.hash(`${timestamp}${lasthash}${data}${nonce}${difficulty}`).toString();
	}
	
	static blockHash(block) {
		const {timestamp, lasthash, data, nonce, difficulty } = block;        //This line declares timestamp, lasthash, and data variables and assigns them 
		return Block.hash(timestamp, lasthash, data, nonce, difficulty);      //to the values of those same variables within the block
	}
	
	static adjustDifficulty(lastBlock, currentTime) {
		let { difficulty } = lastBlock;
		difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
		return difficulty;
	}
}

module.exports = Block;