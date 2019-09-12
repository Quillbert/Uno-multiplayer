var deckImage;
var selected;
var deck = [];
var discard = []
var current;
var turn = 0;
var turnDir = 1;
var pickTime = false;
var players = [];
var picking = null;

let socket;

function preload() {
	deckImage = loadImage("assets/Uno Deck.png");
}

function setup() {
  // put setup code here
  socket = io.connect(location.origin);
  createCanvas(700,500);
  for(let i = 0; i < 4; i++) {
  	players.push(new Player(100, (i+1) * 100));
  }
  startGame();
  cardFunctions();
  if(current.type == 12) {
  	turn += turnDir * 2;
  }
}

function startGame() {
	initializeDeck();
	dealHands();
	current = deck[0];
	deck.splice(0,1);
	if(current.col == 4) {
		current = null;
		for(let i = 0; i < players.length; i++) {
			players[i].cards.length = 0;
		}
		deck.length = 0;
		startGame();
	}
}

function draw() {
  // put drawing code here
  turnWrap();
  background(200,0,0);
  for(let i = 0; i < players.length; i++) {
  	players[i].show();
  }
  current.x = 500;
  current.y = 250;
  current.show();
  image(deckImage, 500, 100);
  players[turn].play();
  drawColorPick();
  showColor();
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
	shuffleCards(deck);
}

function dealHands() {
	for(let i = 0; i < 7; i++) {
		for(let j = 0; j < players.length; j++) {
			players[j].cards.push(deck[0]);
			deck.splice(0,1);
		}
	}
}

function mousePressed() {
	if (pickTime) {
    if (mouseX > 485 && mouseX <  515) {
      if (mouseY > 300 && mouseY < 330) {
        current.col = 0;
        pickTime = false;
        picking = null;
      } else if (mouseY > 330 && mouseY < 360) {
        current.col = 2;
        pickTime = false;
        picking = null;
      }
    } else if (mouseX > 515 && mouseX < 545) {
      if (mouseY > 300 && mouseY < 330) {
        current.col = 1;
        pickTime = false;
        picking = null;
      } else if (mouseY > 330 && mouseY < 360) {
        current.col = 3;
        pickTime = false;
        picking = null;
      }
    }
  } else {

    if (mouseX > 505 && mouseX < 527 && mouseY > 250 && mouseY <272) {
      if (selected != null) {
        if (selected != null && selected.type == current.type || selected.col == current.col || selected.col == 4) {
          discard.push(current);
          if (current.type >= 13) {
            current.col = 4;
          }
          current = selected;
          for(let i = 0; i < players[turn].cards.length; i++) {
          	if(players[turn].cards[i] === selected) {
          		players[turn].cards.splice(i,1);
          		break;
          	}
          }
          if (players[length].cards.length <= 0) {
            noLoop();
            console.log("Player " + (turn + 1) + " wins!");
            window.alert("Player " + (turn + 1) + " wins!");
          }
          selected = null;
          turn += turnDir;
          cardFunctions();
        }
      }
    }
    if (mouseX > 505 && mouseX < 537 && mouseY > 100 && mouseY < 132) {
      selected = deck[0];
      if (selected.type == current.type || selected.col == current.col || selected.col == 4) {
        discard.push(current);
        current = selected;
        deck.splice(0, 1);
        selected = null;
        turn += turnDir;
        cardFunctions();
      } else {
        players[turn].cards.push(deck[0]);
        deck.splice(0, 1);
        selected = null;
        turn += turnDir;
      }
      if (deck.length <= 0) {
        while (discard.length > 0) {
          deck.push(discard[0]);
          discard.splice(0,1);
        }
        shuffleCards(deck);
      }
    }
  }
}

function shuffleCards(a) {
	for(let i = 0; i < a.length; i++) {
	  const j = Math.floor(Math.random() * i);
	  const temp = a[i];
	  a[i] = a[j];
	  a[j] = temp;
	}
}

function cardFunctions() {
	if(current.type > 9) {
		turnWrap();
		switch(current.type) {
			case 10:
			turnWrap();
			for(let i = 0; i < 2; i++) {
				players[turn].cards.push(deck[0]);
				deck.splice(0,1);
			}
			turn += turnDir;
			turnWrap();
			break;
			case 11:
			turn += turnDir;
			turnWrap();
			break;
			case 12:
			turnDir *= -1;
			turn += turnDir;
			turnWrap();
			turn += turnDir;
			turnWrap();
			break;
			case 13:
			colorPick();
			break;
			case 14:
			colorPick();
			turnWrap();
			for(let i = 0; i < 4; i++) {
				players[turn].cards.push(deck[0]);
				deck.splice(0,1);
			}
			turn += turnDir;
			turnWrap();
			break;
		}
	}
}

function turnWrap() {
	if(turn < 0) {
		turn = 3;
	} else if (turn > 3) {
		turn = 0;
	}
}

function drawColorPick() {
	if(pickTime) {
		fill(255, 0, 0);
    	rect(485, 300, 30, 30);
	    fill(255, 255, 0);
	    rect(515, 300, 30, 30);
	    fill(0, 255, 0);
	    rect(485, 330, 30, 30);
	    fill(0, 0, 255);
	    rect(515, 330, 30, 30);
	}
}

function colorPick() {
	pickTime = true;
	turn -= turnDir;
	turnWrap();
	picking = players[turn];
	turn += turnDir;
	turnWrap;
}

function showColor() {
	push();
	noStroke();
	if(current.type > 12) {
		switch(current.col) {
			case 0: fill(255, 0, 0);
			break;
			case 1:
			fill(255, 255, 0);
			break;
			case 2:
			fill(0, 255, 0);
			break;
			case 3:
			fill(0, 0, 255);
			break;
			default:
			noFill();
			break;
		}
		rect(550, 250, 30, 32);
		pop();
	}
}