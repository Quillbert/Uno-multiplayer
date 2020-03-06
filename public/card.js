class Card {
	constructor(type, col, val = 0) {
		this.val = val;
		this.type = type;
		this.col = col;
		this.image = null;
		if(val >= 0) {
			this.image = loadImage("assets/Uno_" + this.col + "-" + this.type +".png");
		}
		this.x = 0;
		this.y = 0;
		this.tx = -1;
		this.ty = -1;
		this.animated = false;
	}
	move() {
		if(this.animated && this.tx >= 0) {
			this.x = lerp(this.x, this.tx, 0.1);
			this.y = lerp(this.y, this.ty, 0.1);
			if(dist(this.x, this.y, this.tx, this.ty) < 0.5) {
				this.x = this.tx;
				this.y = this.ty;
				this.animated = false;
				this.tx = -1;
			}
		}
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
	animate(x, y) {
		this.animated = true;
		this.tx = x;
		this.ty = y;
	}
}