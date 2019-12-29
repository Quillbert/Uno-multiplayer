class Card {
	constructor(type, col, val = 0) {
		this.val = val;
		this.type = type;
		this.col = col;
		this.image = loadImage("assets/Uno_" + this.col + "-" + this.type +".png");
		this.x = 0;
		this.y = 0;
	}
	show() {
		image(this.image, this.x, this.y);
		if(selected != null && selected == this) {
			push();
			stroke(255,100,150);
			noFill();
			strokeWeight(3);
			rect(this.x+5, this.y, 22, 32);
			pop();
		}
	}
	detect() {
		if(mouseIsPressed && !pickTime) {
			if(mx > this.x + 5 && mx < this.x + 27 && my > this.y && my < this.y + 32) {
				selected = this;
				return true;
			}
		}
		return false;
	}
	mouseOver() {
		if(mx > this.x + 5 && mx < this.x + 27 && my > this.y && my < this.y + 32) {
				selected = this;
				return true;
		}
		return false;
	}
}