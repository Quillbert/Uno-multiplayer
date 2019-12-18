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
		this.public = false;
		this.stacking = false;
		this.stackCount = 0;
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
			this.deck.push(new this.Card(13, 4, valCount));
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
				if(!this.stacking) {
					this.forceDraw(2);
					this.turn += this.turnDir;
					this.turnWrap();
				} else {
					this.stackCount += 2;
					if(this.cantPlayNumber(10)) {
						this.acceptFate();
					}
				}
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
				if(!this.stacking) {
					for(let i = 0;  i < 4; i++) {
						this.players[this.turn].cards.push(this.deck[0]);
						this.deck.splice(0,1);
						this.reShuffle();
					}
					this.turn += this.turnDir;
					this.turnWrap();
				} else {
					this.stackCount += 4;
					if(this.cantPlayNumber(14)) {
						this.acceptFate();
					}
				}
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
	reShuffle() {
		if (this.deck.length <= 0) {
	        while (this.discard.length > 0) {
	            this.deck.push(this.discard[0]);
	            this.discard.splice(0,1);
	        }
	        shuffleCards(this.deck);
	    }
	}
	cantPlay() {
		var game = this;
		var wrong = this.players[game.turn].cards.find(function(element) {
			return element.col == 4 || element.col == game.current.col || element.type == game.current.type;
		});
		return wrong == null;
	}
	cantPlayColor() {
		var game = this;
		var wrong = this.players[game.turn].cards.find(function(element) {
			return element.col == game.current.col;
		});
		return wrong == null;
	}
	cantPlayNumber(num) {
		var game = this;
		var wrong = this.players[game.turn].cards.find(function(element) {
			return element.type == num;
		});
		return wrong == null;
	}
	forceDraw(num) {
		for(let i = 0;  i < num; i++) {
			this.players[this.turn].cards.push(this.deck[0]);
			this.deck.splice(0,1);
			this.reShuffle();
		}
	}
	acceptFate() {
		this.forceDraw(this.stackCount);
		this.stackCount = 0;
		this.turn += this.turnDir;
		this.turnWrap();
	}
}

module.exports = Game;