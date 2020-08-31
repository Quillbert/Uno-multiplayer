class UI {
	constructor() {
		this.uno = new Button(500, 400, 70, 40, "Uno", 20, false);
		this.accept = new Button(500, 350, 70, 40, "Accept", 18, false);
		this.keep = new Button(470, 140, 70, 40, "Keep", 18, false);
		this.play = new Button(550, 140, 70, 40,  "Play", 18, false);
		this.start = new Button(300, 300, 100, 40, "Start Now", 16, false);

		this.uno.setVisibilityTest(function() {
			return started && players[playerNum].cards.length == 2 && !players[playerNum].uno && playerNum == turn && !cantPlay() && current != null;
		});
		this.accept.setVisibilityTest(function() {
			return started && playerNum == turn && stackCount > 0 && current != null;
		});
		this.keep.setVisibilityTest(function() {
			return started && drew;
		});
		this.play.setVisibilityTest(function() {
			return started && drew;
		});
		this.start.setVisibilityTest(function() {
			return !started && playerNum == 0 && playerCount >= 2;
		});

		this.uno.setEffect(function() {
			players[playerNum].uno = true;
		});
		this.accept.setEffect(function() {
			drawCard();
		});
		this.keep.setEffect(function() {
			drawCard(true);
			drew = false;
		});
		this.play.setEffect(function() {
			if(selected.col == 4) {
				pickTime = true;
			} else {
				send(selected);
			}
			drew = false;
		});
		this.start.setEffect(function() {
			socket.emit('begin', "");
		});

		this.buttons = [this.uno, this.accept, this.keep, this.play, this.start];
	}
	show() {
		for(let i = 0; i < this.buttons.length; i++) {
			this.buttons[i].evaluateVisibility();
			this.buttons[i].show();
		}
	}
	mousePressed() {
		for(let i = 0; i < this.buttons.length; i++) {
			this.buttons[i].mousePressed();
		}
	}
}