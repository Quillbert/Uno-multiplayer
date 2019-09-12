class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.cards = [];
	}
	show() {
		if(players[turn] === this) {
			for (let i = 0; i < this.cards.length; i++) {
				this.cards[i].x = this.x + (i%15) * 25;
				this.cards[i].y = this.y + floor(i/15) * 35;
				this.cards[i].show();
			}
		} else {
			for(let i = 0; i < this.cards.length; i++) {
				image(deckImage, (i%15) * 25, floor(i/15) * 35);
			}
		}
	}
	play() {
		for(let i = 0; i < this.cards.length; i++) {
			this.cards[i].detect();
		}
	}
}