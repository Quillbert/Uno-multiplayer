class Button {
	constructor(x = 0, y = 0, wid = 70, hei = 40, text = "", textSize = 14, visible = true) {
		this.x = x;
		this.y = y;
		this.wid = wid;
		this.hei = hei;
		this.text = text;
		this.textSize = textSize;
		this.visible = visible;
		this.effect;
		this.visibilityTest;
	}
	setLocation(x, y) {
		this.x = x;
		this.y = y;
	}
	setText(text) {
		this.text = text;
	}
	setVisible(visiblity) {
		this.visible = visiblity;
	}
	setDeminsions(w, h) {
		this.wid = w;
		this.hei = h;
	}
	setTextSize(size) {
		this.textSize = size;
	}
	show() {
		if(this.visible) {
			push();
			fill(230);
			rect(this.x, this.y, this.wid, this.hei);
			fill(0);
			textSize(this.textSize);
			textAlign(CENTER, CENTER);
			text(this.text, this.x + this.wid/2, this.y + this.hei/2);
			pop();
		}
	}
	mousePressed() {
		if(this.visible) {
			if(mx > this.x && mx < this.x + this.wid && my > this.y && my < this.y + this.hei) {
				this.effect();
			}
		}
	}
	evaluateVisibility() {
		this.visible = this.visibilityTest();
	}
	setEffect(effect) {
		this.effect = effect;
	}
	setVisibilityTest(test) {
		this.visibilityTest = test;
	}
}