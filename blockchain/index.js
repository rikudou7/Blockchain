const Block = require('./block');

class BlockChain {
	constructor() {
		this.chain = [Block.genesis()];
	}
	
	ToString() {
		var result = "";
		for(var i = 0; i < this.chain.length; i++) {
			result += this.chain[i].ToString();
			result += "\n";
		}
		return result;
	}
	
    getLastBlock() {
		return this.chain[this.chain.length - 1];
	}
	
	addBlockToChain(data) {
		const blockToAdd = Block.mineBlock(this.getLastBlock(), data);
		this.chain.push(blockToAdd);
		return blockToAdd;
	}
	
	isChainValid(chain) {
		if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { //!== means that they are not equal type or not of equal value
			return false;
		}
		for(var i = 1; i < chain.length; i++) {
			if(chain[i - 1].hash != chain[i].lasthash) {
				return false;
			}
			if(chain[i].hash !== Block.blockHash(chain[i])) {
				return false;
			}
		}
		return true;
	}
	
	replaceChain(newChain) {
		if(newChain.length <= this.chain.length) {
			console.log("Chain is not longer than the current chain");
			return;
		} else if(!this.isChainValid(newChain)) {
			console.log("This chain is not valid.");
			return;
		}
		console.log("Replacing current chain with new chain.");
		this.chain = newChain;
		return;
	}
	
	
}

module.exports = BlockChain;