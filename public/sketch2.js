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

function preload() {
	deckImage = loadImage('assets/Uno Deck.png');
	initializeDeck();
	for(let i = 0; i < 4; i++) {
		players.push(new Player(100, (i+1) * 100));
	}
}

function setup() {
	createCanvas(700,500);
	if(getURLParams().game == null) {
		window.location.replace("http://quillbert.tk/uno/");
	}
	socket = io.connect(location.origin);
	socket.emit('thing', getURLParams().game);
	//socket.emit('thing', "game");
	socket.on('message', function(data) {
		console.log(data);
	});
	socket.on('thing', function(data) {
		if(data == "too late") {
			late = true;
		} else {
			console.log("PlayerNum = " + data);
			playerNum = data;
		}
	});
	socket.on('state', function(data) {
		//console.log(data.hands);
		started = true;
		update(data);
		sent = false;
	});
	socket.on('oops', function(data) {
		socket.disconnect();
		if(!finished) {
			window.alert("Someone decided to leave, effectively breaking this game. You will now be disconnected.");
		}
		window.location.replace("http://quillbert.tk/uno/");
	});
}

function draw() {
	background(200,0,0);
	if(late) {
		textAlign(CENTER, CENTER);
		textSize(30);
		fill(0);
		text("This game has already started. Please try another game.", 350, 250);
	} else if(!started) {
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
		    showUno();
		}
		if(turn >= 0) {
			image(deckImage, 500, 100);
			players[playerNum].play();
		}
		fill(255,150,0);
		switch(turn) {
			case 0:
				triangle(50,100,50,132,75,116);
				break;
			case 1:
				triangle(50,200,50,232,75,216);
				break;
			case 2:
				triangle(50,300,50,332,75,316);
				break;
			case 3:
				triangle(50,400,50,432,75,416);
				break;
			default:
				break;
		}
		if(pickTime) {
			showColorPick();
		}
		showUnoCalled();
	}
	textSize(15);
	fill(0,0,0);
	textAlign(LEFT, TOP)
	text("Game Name: " + getURLParams().game, 550, 10);
}

function update(data) {
	//console.log(data);
	for(let i = 0; i < data.hands.length; i++) {
		players[i].cards.length = 0;
		//console.log(data.hands[i].ids.length);
		var handLength = data.hands[i].ids.length;
		for(let j = 0; j < handLength; j++) {
			players[i].cards.push(deck.find(function(element) {
				return element.val == data.hands[i].ids[j];
				//return deck[0];
			}));
		}
	}
	current = deck.find(function(element) {
		return element.val == data.current.id;
	});
	current.col = data.current.color;
	turn = data.turn;
	next = data.next;
	for(let i = 0; i < players.length; i++) {
		if(players[i].cards.length <= 0) {
			noLoop();
			window.alert("Player " + (i+1) + " wins!");
			finished = true;
			window.location.replace("http://quillbert.tk/uno/");
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
	if(pickTime) {
		if(selected == null) {
			selected = current;
		}
		if (mouseX > 485 && mouseX <  515) {
        	if (mouseY > 300 && mouseY < 330) {
		    	selected.col = 0;
	        	pickTime = false;
	        	send(selected);
	        	
	        	selected = null;
	        } else if (mouseY > 330 && mouseY < 360) {
		        selected.col = 2;
		        pickTime = false;
		        send(selected);
		        
		        selected = null;
	        }
	    } else if (mouseX > 515 && mouseX < 545) {
	        if (mouseY > 300 && mouseY < 330) {
		        selected.col = 1;
		        pickTime = false;
		        send(selected);
		        
		        selected = null; 
		    } else if (mouseY > 330 && mouseY < 360) {
		        selected.col = 3;
		        pickTime = false;
		        send(selected);
		        
		        selected = null;
	        }
	    }
	} else if(turn == playerNum) {
		if(mouseX > 505 && mouseX < 527 && mouseY > 250 && mouseY <282) {
				if(selected != null) {
				if(current.type == selected.type || current.col == selected.col) {
					if(selected.col == 4) {
						pickTime = true;
					} else {
						send(selected);
						
						selected = null;
					}
					if(selected != null) {
						if(selected.col != 4) {
							selected = null;
						}
					}
				} else if(selected.col == 4) {
					pickTime = true;
				}
			}
		} else if(mouseX > 505 && mouseX < 527 && mouseY > 100 && mouseY < 132) {
			if(next.type > 12) {
				pickTime = true;
				selected = deck.find(function(element) {
					return element.val == next.id;
				});
			} else {
				drawCard();
				
				selected = null;
			}
		}
	}
	detectUno();
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
	players[playerNum].uno = false;
}

function drawCard() {
	var out = {
		draw: true
	}
	if(!sent) {
		socket.emit('turn', out);
	}
	sent = true;
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

function showUno() {
	if(players[playerNum].cards.length == 2 && !players[playerNum].uno && playerNum == turn) {
		fill(230);
		rect(500, 400, 70, 40);
		fill(0);
		textAlign(CENTER, CENTER);
		textSize(20);
		text("Uno", 535, 420);
	} 
}

function showUnoCalled() {
	for(let i = 0; i < players.length; i++) {
		if(players[i].cards.length == 1) {
			fill(230);
			rect(150, players[i].y, 32, 32);
			fill(0);
			textAlign(CENTER, CENTER);
			textSize(20);
			text("1", 166, players[i].y+16);
		}
	}
}

function detectUno() {
	if(players[playerNum].cards.length == 2 && turn == playerNum) {
		if(mouseX > 500 && mouseX < 570 && mouseY > 400 && mouseY < 440) {
			players[playerNum].uno = true;
		}
	}
}