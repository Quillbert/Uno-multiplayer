class Player {
	constructor(x = 0, y = 0, id="") {
		this.x = x;
		this.y = y;
		this.cards = [];
		this.uno = false;
		this.id = id;
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
	play() {
		for(let i = 0; i < this.cards.length; i++) {
			this.cards[i].detect();
		}
	}
}

module.exports = Player;