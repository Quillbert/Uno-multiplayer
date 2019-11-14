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
			if(mouseX > this.x + 5 && mouseX < this.x + 27 && mouseY > this.y && mouseY < this.y + 32) {
				selected = this;
			}
		}
	}
}