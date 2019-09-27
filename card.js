class Card {
	constructor(type, col, val = 0) {
		this.val = val;
		this.type = type;
		this.col = col;
		this.x = 0;
		this.y = 0;
	}
	detect() {
		if(mouseIsPressed) {
			if(mouseX > this.x + 5 && mouseX < this.x + 27 && mouseY > this.y && mouseY < this.y + 32) {
				selected = this;
			}
		}
	}
}

module.exports = Card;