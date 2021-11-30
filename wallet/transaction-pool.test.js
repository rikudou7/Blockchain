const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const BlockChain = require('../blockchain');
describe('TransactionPool', () => {
    let tp, wallet, bc, transaction;
    beforeEach(() => {
	    tp = new TransactionPool();
		wallet = new Wallet();
		bc = new BlockChain();
		transaction = wallet.createTransaction('joe', 30, bc, tp);
    });
	it('Adds a transaction to the pool', () => {
		
		expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
		
	});
	
	it('Updates a transaction in the pool', () => {
		const oldTransaction = JSON.stringify(transaction);
		const newTransaction = transaction.update(wallet, 'bob', 40);
		tp.updateOrAddTransaction(newTransaction);
		expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id))).not.toEqual(oldTransaction);
		
	});
	
	it('clears transactions', () => {
		tp.clear();
		expect(tp.transactions).toEqual([]);
		
	});
	
	describe('mixing valid and corrupt transactions', () => {
		let validTransactions;
		
		beforeEach(() => {
			validTransactions = [...tp.transactions];
			for(let i = 0; i < 6; i++) {
				wallet = new Wallet();
				transaction = wallet.createTransaction('bob', 30, bc, tp);
				if(i % 2 == 0) {
					transaction.input.amount = 99999;
				} else {
					validTransactions.push(transaction);
				}
			}
		});
		it('shows a difference between valid and corrupt transactions', () => {
		
		    expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
		
	    });
		it('grabs valid transactions', () => {
		
		    expect(tp.validTransactions()).toEqual(validTransactions);
		
	    });
	});
	
	
});