class Player {
	constructor(x = 0, y = 0, id="") {
		this.x = x;
		this.y = y;
		this.cards = [];
		this.uno = false;
		this.id = id;
		this.unoButton = new Button(this.x+50, this.y, 32, 32, "!!", 20, false);
		var player = this;
		this.unoButton.setVisibilityTest(function() {
			return players[previous] == player && !players[previous].uno && players[previous].cards.length == 1;
		});
		this.unoButton.setEffect(function() {
			socket.emit("uno", 1);
		});
	}
	show() {
		if((picking == null && players[turn] === this) || picking === this) {
			for (let i = 0; i < this.cards.length; i++) {
				this.cards[i].x = this.x + (i%15) * 25;
				this.cards[i].y = this.y + floor(i/15) * 35;
				this.cards[i].show();
			}
		} else {
			for(let i = 0; i < this.cards.length; i++) {
				image(deckImage, this.x + (i%15) * 25, this.y + floor(i/15) * 35);
			}
		}
	}
	showHand() {
		if(this.cards.length > 0) {
			for (let i = 0; i < this.cards.length; i++) {
				this.cards[i].show();
				this.cards[i].move();
			}
		}
		this.unoButton.evaluateVisibility();
		this.unoButton.show();
	}
	showBack() {
		for(let i = 0; i < this.cards.length; i++) {
			image(deckImage, this.cards[i].x, this.cards[i].y);
			this.cards[i].move();
		}
		this.unoButton.evaluateVisibility();
		this.unoButton.show();
	}
	assignCardLocations() {
		for (let i = 0; i < this.cards.length; i++) {
				this.cards[i].x = this.x + (i%15) * 25;
				this.cards[i].y = this.y + floor(i/15) * 35;
			}
	}
	play() {
		for(let i = 0; i < this.cards.length; i++) {
			this.cards[i].detect();
		}
	}
}