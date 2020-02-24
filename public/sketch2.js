var socket;
var playerNum;
var deckImage = -1;
var deck = [];
var players = [];
var selected = null;
var current = null;
var turn = -1;
var pickTime = false;
var sent = false;
var next;
var started = false;
var late = false;
var finished = false;
var displayText = "";
var titleText = "";
var scaleFactor;
var mx, my;
var stackCount = 0;
var forcePlay;
var drew = false;
var ui;
var previous = 0;
var animated = false;

function preload() {
	deckImage = loadImage('assets/Uno Deck.png');
	initializeDeck();
	for(let i = 0; i < 4; i++) {
		players.push(new Player(100, (i+1) * 100));
	}
}

function setup() {
	setInterval(function() {
		if(finished && document.visibilityState == 'visible') {
			setTimeout(function() {
				window.location.replace("http://quillbert.tk/uno/");
			}, 4000);
		}
	}, 100);
	createCanvas(windowWidth, windowHeight);
	ui = new UI();
	if(getURLParams().game == null) {
		window.location.replace("http://quillbert.tk/uno/");
	}
	socket = io.connect(location.origin);
	socket.emit('thing', getURLParams().game);
	socket.on('message', function(data) {
		console.log(data);
	});
	socket.on('thing', function(data) {
		if(data == "too late") {
			late = true;
		} else {
			playerNum = data.playerNum;
			forcePlay = data.forcePlay;
		}
	});
	socket.on('state', function(data) {
		started = true;
		update(data);
		sent = false;
		console.log(data);
	});
	socket.on('oops', function(data) {
		socket.disconnect();
		if(!finished) {
			window.document.title = "Oops!";
			finished = true;
			displayText = "Someone left, ending this game. :(";
		}
	});
}

function draw() {
	push();
	scaleFactor = min(width/700, height/500);
	scale(scaleFactor);
	mx = mouseX / scaleFactor;
	my = mouseY / scaleFactor;
	var transX = 0;
	if(width > 700) {
		transX = (width/2);
		transX -= 350 * scaleFactor;
		transX /= scaleFactor;
	}
	translate(transX, 0);
	mx -= transX;
	background(200,0,0);
	line(0,0,0,500);
	line(700,0,700,500);
	if(late && !finished) {
		textAlign(CENTER, CENTER);
		textSize(30);
		fill(0);
		text("This game has already started. Please try another game.", 350, 250);
	} else if(!started && !finished) {
		textAlign(CENTER, CENTER);
		textSize(30);
		fill(0);
		text("Waiting for more players.", 350, 250);
	} else {
		for(let i = 0; i < players.length; i++) {
			if(i == playerNum) {
				players[i].showHand();
			} else {
				players[i].showBack();
			}
		}
		if(current != null) {
			current.x = 500;
		    current.y = 250;
		    current.show();
		    showColor();
		}
		if(turn >= 0) {
			image(deckImage, 500, 100);
			players[playerNum].play();
		}
		fill(255,150,0);
		switch(turn) {
			case 0:
				triangle(50,100,50,132,75,116);
				showStackCount(18,100);
				break;
			case 1:
				triangle(50,200,50,232,75,216);
				showStackCount(18,200);
				break;
			case 2:
				triangle(50,300,50,332,75,316);
				showStackCount(18,300);
				break;
			case 3:
				triangle(50,400,50,432,75,416);
				showStackCount(18,400);
				break;
			default:
				break;
		}
		if(pickTime) {
			showColorPick();
		}
		showUnoCalled();
		showNextCard();
		ui.show();
	}
	textSize(15);
	fill(0,0,0);
	textAlign(RIGHT, TOP);
	text("Game Code: " + window.decodeURIComponent(getURLParams().game), 680, 10);
	if(finished) {
		textAlign(CENTER,CENTER);
		textSize(30);
		text(displayText, 350, 250);
		noLoop();
	}
	pop();
}

function update(data) {
	for(let i = 0; i < data.hands.length; i++) {
		players[i].uno = data.uno[i];
		players[i].cards.length = 0;
		var handLength = data.hands[i].ids.length;
		for(let j = 0; j < handLength; j++) {
			var card = deck.find(function(element) {
				return element.val == data.hands[i].ids[j];
			});
			if(card == null) {
				card = new Card(-1, -1, -1);
			}
			players[i].cards.push(card);
		}
	}
	current = deck.find(function(element) {
		return element.val == data.current.id;
	});
	current.col = data.current.color;
	turn = data.turn;
	next = data.next;
	stackCount = data.stackCount;
	previous = data.previous;
	for(let i = 0; i < players.length; i++) {
		players[i].assignCardLocations();
		if(players[i].cards.length <= 0) {
			textAlign(CENTER,CENTER);
			textSize(30);
			window.document.title = "Player " + (i+1) + " wins!";
			text("Player " + (i+1) + " wins!", 350, 250);
			displayText = "Player " + (i+1) + " wins!"
			finished = true;
		}
	}
}

function initializeDeck() {
	var valCount = 0;
	deck.length = 0;
	for(let i = 0; i < 2; i++) {
		for(let j = 0; j < 4; j++) {
			for(let k = 1; k < 13; k++) {
				deck.push(new Card(k, j, valCount));
				valCount++;
			}
		}
	}
	for(let i = 0; i < 4; i++) {
		deck.push(new Card(0, i, valCount));
		valCount++;
		deck.push(new Card(13, 4, valCount));
		valCount++;
		deck.push(new Card(14, 4, valCount));
		valCount++;
	}
}


function mousePressed() {
	if(!animated) {
		if(pickTime) {
			if(selected == null) {
				selected = current;
			}
			if (mx > 485 && mx <  515) {
	        	if (my > 300 && my < 330) {
			    	selected.col = 0;
		        	pickTime = false;
		        	send(selected);
		        	
		        	selected = null;
		        } else if (my > 330 && my < 360) {
			        selected.col = 2;
			        pickTime = false;
			        send(selected);
			        
			        selected = null;
		        }
		    } else if (mx > 515 && mx < 545) {
		        if (my > 300 && my < 330) {
			        selected.col = 1;
			        pickTime = false;
			        send(selected);
			        
			        selected = null; 
			    } else if (my > 330 && my < 360) {
			        selected.col = 3;
			        pickTime = false;
			        send(selected);
			        
			        selected = null;
		        }
		    }
		} else if(turn == playerNum) {
			if(mx > 505 && mx < 527 && my > 250 && my <282) {
				if(selected != null) {
					if(current.type == selected.type || current.col == selected.col) {
						if(selected.col == 4) {
							if(selected.type != 14 || cantPlayColor() || stackCount > 0 || !forcePlay) {
								pickTime = true;
							} else {
								window.alert("You can only play a +4 if you do not have the current color.");
							}
						} else {
							send(selected);
							selected = null;
						}
					} else if(selected.col == 4) {
						if(selected.type != 14 || cantPlayColor() || stackCount > 0 || !forcePlay) {
							pickTime = true;
						} else {
							window.alert("You can only play a +4 if you do not have the current color.");
						}
					}
				}
			} else if(mx > 505 && mx < 527 && my > 100 && my < 132 && (cantPlay() || !forcePlay)) {
				if(next.type > 12 && forcePlay) {
					pickTime = true;
					selected = deck.find(function(element) {
						return element.val == next.id;
					});
				} else {
					if(forcePlay || (next.color != current.col && next.type != current.type && next.color != 4)) {
						drawCard();
						selected = null;
					} else {
						drew = true;
					}
				}
			}
		}
		ui.mousePressed();
		for(let i = 0; i < players.length; i++) {
			players[i].unoButton.mousePressed();
		}
	}
}

function send(card) {
	var out = {
		draw: false,
		type: card.type,
		color: card.col,
		id: card.val,
		uno: players[playerNum].uno
	}
	if(!sent) {
		socket.emit('turn', out);
	}
	sent = true;
	//players[playerNum].uno = false;
	drew = false;
	selected = null;
}

function drawCard(k = false) {
	var out = {
		draw: true,
		keep: k
	}
	if(!sent) {
		socket.emit('turn', out);
	}
	sent = true;
	drew = false;
	selected = null;
}

function showColorPick() {
	fill(255, 0, 0);
	rect(485, 300, 30, 30);
    fill(255, 255, 0);
    rect(515, 300, 30, 30);
    fill(0, 200, 0);
    rect(485, 330, 30, 30);
    fill(0, 0, 255);
    rect(515, 330, 30, 30);
}

function showColor() {
	push();
	if(current.type > 12) {
		switch(current.col) {
			case 0: 
			fill(255, 0, 0);
			break;
			case 1:
			fill(255, 255, 0);
			break;
			case 2:
			fill(0, 200, 0);
			break;
			case 3:
			fill(0, 0, 255);
			break;
			default:
			noFill();
			break;
		}
		rect(550, 250, 30, 32);
	}
	pop();
}

function showUnoCalled() {
	for(let i = 0; i < players.length; i++) {
		if(players[i].uno && players[i].cards.length == 1) {
			fill(230);
			rect(150, players[i].y, 32, 32);
			fill(0);
			textAlign(CENTER, CENTER);
			textSize(20);
			text("1", 166, players[i].y+16);
		}
	}
}

function cantPlay() {
	var wrong = players[playerNum].cards.find(function(element) {
		return element.col == 4 || element.col == current.col || element.type == current.type;
	});
	if(wrong == null) {
		return true;
	} else {
		return false;
	}
}
function cantPlayColor() {
	var wrong = players[playerNum].cards.find(function(element) {
		return element.col == current.col;
	});
	if(wrong == null) {
		return true;
	} else {
		return false;
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	scaleFactor = min(width/700, height/500);
}

function showStackCount(x, y) {
	if(stackCount > 0) {
		fill(255,150,0);
		rect(x, y, 32, 32);
		fill(0);
		textSize(14);
		textAlign(CENTER, CENTER);
		text("+" + stackCount, x+16, y+16);
	}
}

function doubleClicked() {
	for(let i = 0; i < players[playerNum].cards.length; i++) {
		if(players[playerNum].cards[i].mouseOver() && turn == playerNum && !pickTime && !animated) {
			if(selected != null) {
				if(current.type == selected.type || current.col == selected.col) {
					if(selected.col == 4) {
						if(selected.type != 14 || cantPlayColor() || stackCount > 0 || !forcePlay) {
							pickTime = true;
						} else {
							window.alert("You can only play a +4 if you do not have the current color.");
						}
					} else {
						send(selected);
						selected = null;
					}
				} else if(selected.col == 4) {
					if(selected.type != 14 || cantPlayColor() || stackCount > 0 || !forcePlay) {
						pickTime = true;
					} else {
						window.alert("You can only play a +4 if you do not have the current color.");
					}
				}
			}
		}
	}
}

function showNextCard() {
	if(drew) {
		selected = deck.find(function(element) {
			return element.val == next.id;
		});
		selected.x = 550;
		selected.y = 100;
		selected.show();
	}
}

function keyPressed() {
	players[0].cards[0].animate(random(0, 700), random(0, 500));
}