var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
var state;
var userCount = 0;
const Game = require("./game.js");
const Player = require("./player.js");
const Card = require("./card.js");
app.use(express.static(__dirname + "/public"));
var socket = require('socket.io');
var io = socket(server);
console.log("socket started");
var game = new Game("game");
var games;
io.on("connection", function(socket) {
	userCount++;
	console.log(userCount);
	socket.on('disconnect', function(socket) {
		userCount--;
		console.log(userCount);
		if(userCount <= 0) {
			game = new Game("game");
		}
	});
	socket.on('thing', function(data) {
		if(!game.started) {
			io.to(socket.id).emit('thing', game.players.length);
			game.players.push(new Player(0, 0, socket.id));
			if(game.players.length == 4) {
				game.begin();
				state = findState(game);
				io.emit('state', state);
			}
		}
	});
	socket.on('turn', function(data) {
		console.log(data);
		if(data.draw) {
			if(game.current.col == game.deck[0].col || game.current.type == game.deck[0].type) {
				game.discard.push(game.current);
				game.current = game.deck[0];
				game.deck.splice(0,1);
				game.turn += game.turnDir;
				game.turnWrap();
				game.cardFunctions();
				game.turnWrap();
				game.reShuffle();
				state = findState(game);
				io.emit('state', state);
			} else {
				game.players[game.turn].cards.push(game.deck[0]);
				game.deck.splice(0,1);
				game.reShuffle();
				game.turn += game.turnDir;
				game.turnWrap();
				state = findState(game);
				io.emit('state', state);
			}
		} else {
			var card = null;
			for(let i = 0; i < game.players[game.turn].cards.length; i++) {
				if(data.id == game.players[game.turn].cards[i].val) {
					card = game.players[game.turn].cards[i];
					if(!data.uno && game.players[game.turn].cards.length == 2) {
						for(let i = 0; i < 2; i++) {
							game.players[game.turn].cards.push(game.deck[0]);
							game.deck.splice(0,1);
						}
					}
				}
			}
			if(card != null) {
				card.col = data.color;
				console.log(card);
				if(game.current.type >= 13) {
					game.current.col = 4;
				}
				game.discard.push(game.current);
				game.current = card;
				game.current.col = data.color;
				for(let i = 0; i < game.players[game.turn].cards.length; i++) {
					if(game.players[game.turn].cards[i].val == card.val) {
						game.players[game.turn].cards.splice(i, 1);
					}
				}
			} else {
				if(data.id == game.deck[0].val) {
					card = game.deck[0];
				}
				game.discard.push(game.current);
				game.current = card;
				game.current.col = data.color;
				game.deck.splice(0,1);
			}
			game.turn += game.turnDir;
			game.turnWrap();
			game.cardFunctions();
			game.turnWrap();
		}
		state = findState(game);
		io.emit('state', state);
	});
	//io.emit('message', "hello");
});

function findState(game) {
	var out = {
		current: {
			type: game.current.type,
			color: game.current.col,
			id: game.current.val
		},
		next: {
			type: game.deck[0].type,
			color: game.deck[0].col,
			id: game.deck[0].val
		},
		hands: [],
		turn: game.turn,
		uno: {
			player: 0,
			happened: false
		}

	};
	for(let i = 0; i < game.players.length; i++) {
		var hand = {
			ids: []
		}
		for(let j = 0; j < game.players[i].cards.length; j++) {
			hand.ids.push(game.players[i].cards[j].val);
		}
		out.hands.push(hand);
	}
	return out;
}