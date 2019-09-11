class Player {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.cards = [];
	}
	show() {
		for (let i = 0; i < this.cards.length; i++) {
			this.cards[i].x = this.x + (i%15) * 25;
			this.cards[i].y = this.y + floor(i/15) * 35;
			this.cards[i].show();
		}
	}
	play() {
		for(let i = 0; i < this.cards.length; i++) {
			this.cards[i].detect();
		}
	}
}