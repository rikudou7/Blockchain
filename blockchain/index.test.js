const Block = require('./block');
const BlockChain = require('./index');

describe('BlockChain', () => {
    let blockchain, blockchain2;
    beforeEach(() => {
		blockchain = new BlockChain();
		blockchain2 = new BlockChain();
    });
	it('Checks to see if all is correct when a new block is added to the `blockchain`', () => {
		blockchain.addBlockToChain('foo');
		expect(blockchain.chain.length).toEqual(2);
		expect(blockchain.chain[0]).toEqual(Block.genesis());
		expect(blockchain.chain[1].data).toEqual('foo');
		expect(blockchain.chain[1].lasthash).toEqual(Block.genesis().hash);
	});
	
	it('Checks to see if the `blockchain` is valid', () => {
		blockchain2.addBlockToChain('foo');
		expect(blockchain.isChainValid(blockchain2.chain)).toBe(true);
	});
	
	it('Invalidates a chain with a corrupt genesis block', () => {
		blockchain2.chain[0].data = "bad data";
		expect(blockchain.isChainValid(blockchain2.chain)).toBe(false);
	});
	
	it('Invalidates a corrupt chain', () => {
		blockchain2.addBlockToChain('foo');
		blockchain2.chain[1].data = "not foo";
		expect(blockchain.isChainValid(blockchain2.chain)).toBe(false);
	});
	
	it('Replaces a chain with a new valid chain', () => {
		blockchain2.addBlockToChain('bar');
		blockchain.replaceChain(blockchain2.chain);
		expect(blockchain.chain).toEqual(blockchain2.chain);
	});
	
	it('Does not replace a chain with a new chain that is too short', () => {
		blockchain.addBlockToChain('bar');
		blockchain.replaceChain(blockchain2.chain);
		expect(blockchain.chain).not.toEqual(blockchain2.chain);
	});
});