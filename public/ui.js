class UI {
	constructor() {
		this.uno = new Button(500, 400, 70, 40, "Uno", 20, false);
		this.accept = new Button(500, 350, 70, 40, "Accept", 18, false);
		this.keep = new Button(470, 140, 70, 40, "Keep", 18, false);
		this.play = new Button(550, 140, 70, 40,  "Play", 18, false);

		this.uno.setVisibilityTest(function() {
			return players[playerNum].cards.length == 2 && !players[playerNum].uno && playerNum == turn && !cantPlay() && current != null;
		});
		this.accept.setVisibilityTest(function() {
			return playerNum == turn && stackCount > 0 && current != null;
		});
		this.keep.setVisibilityTest(function() {
			return drew;
		});
		this.play.setVisibilityTest(function() {
			return drew;
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

		this.buttons = [this.uno, this.accept, this.keep, this.play];
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