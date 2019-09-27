class Game {
	constructor(id) {
		this.Card = require("./card.js");
		this.id = id;
		this.selected = null;
		this.deck = [];
		this.discard = [];
		this.current = null;
		this.turn = 0;
		this.turnDir = 1;
		this.players = [];
		this.started = false;
	}
	begin() {
		this.started = true;
		this.startGame();
		this.cardFunctions();
		if(this.current.type == 12) {
			this.turn += this.turnDir * 2;
		}
	}
	startGame() {
		this.initializeDeck();
		this.dealHands();
		this.current = this.deck[0];
		this.deck.splice(0,1);
		if(this.current.col == 4) {
			this.current = null;
			for(let i = 0; i < this.players.length; i++) {
				this.players[i].cards.length = 0;
			}
			this.deck.length = 0;
			this.startGame();
		}
	}
	initializeDeck() {
		var valCount = 0;
		this.deck.length = 0;
		for(let i = 0; i < 2; i++) {
			for(let j = 0; j < 4; j++) {
				for(let k = 1; k < 13; k++) {
					this.deck.push(new this.Card(k, j, valCount));
					valCount++;
				}
			}
		}
		for(let i = 0; i < 4; i++) {
			this.deck.push(new this.Card(0, i, valCount));
			valCount++;
			this.deck.push(new this.Card(14, 4, valCount));
			valCount++;
			this.deck.push(new this.Card(14, 4, valCount));
			valCount++;
		}
		this.shuffleCards(this.deck);
	}
	dealHands() {
		for(let i = 0; i < 7; i++) {
			for(let j = 0; j < this.players.length; j++) {
				this.players[j].cards.push(this.deck[0]);
				this.deck.splice(0, 1);
			}
		}
	}
	shuffleCards(a) {
		for(let i = 0; i < a.length; i++) {
			const j = Math.floor(Math.random() * i);
			const temp = a[i];
			a[i] = a[j];
			a[j] = temp;
		}
	}
	cardFunctions() {
		if(this.current.type > 9) {
			this.turnWrap();
			switch(this.current.type) {
				case 10:
				this.turnWrap();
				for(let i = 0;  i < 2; i++) {
					this.players[this.turn].cards.push(this.deck[0]);
					this.deck.splice(0,1);
				}
				this.turn += this.turnDir;
				this.turnWrap();
				break;
				case 11:
				this.turn += this.turnDir;
				this.turnWrap();
				break;
				case 12:
				this.turnDir *= -1;
				this.turn += this.turnDir;
				this.turnWrap();
				this.turn += this.turnDir;
				this.turnWrap();
				break;
				case 14:
				this.turnWrap();
				for(let i = 0;  i < 4; i++) {
					this.players[this.turn].cards.push(this.deck[0]);
					this.deck.splice(0,1);
				}
				this.turn += this.turnDir;
				this.turnWrap();
				break;
				default:
				break;
			}
		}
	}
	turnWrap() {
		if(this.turn < 0) {
			this.turn = this.players.length - 1;
		} else if(this.turn > this.players.length-1) {
			this.turn = 0;
		}
	}
}

module.exports = Game;