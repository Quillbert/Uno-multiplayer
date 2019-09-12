class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.cards = [];
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