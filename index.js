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
//var game = new Game("game");
var games = [];
setInterval(function() {
	for(let i = 0; i < games.length; i++) {
		if(games[i].players.length <= 0) {
			games.splice(i, 1);
		}
	}
}, 10000);
io.on("connection", function(socket) {
	socket.on('disconnect', function(data) {
		var game;
		console.log(socket.id);
		for(let i = 0; i < games.length; i++) {
			for(let j = 0; j < games[i].players.length; j++) {
				if(games[i].players[j].id == socket.id) {
					game = games[i];
				}
			}
		}
		console.log(game);
		if(game != null) {
			io.to(game.id).emit('oops', "d");
		}
		for(let i = 0; i < games.length; i++) {
			if(games[i] == game) {
				games.splice(i,1);
			}
		}
	});
	socket.on('thing', function(data) {
		game = games.find(function(element) {
			return element.id == data;
		});
		socket.join(data);
		//console.log(data);
		if(game == null) {
			games.push(new Game(decodeURI(data).replace(/[^a-zA-Z0-9]/g, "")));
			game = games[games.length-1];
		}
		if(!game.started) {
			io.to(socket.id).emit('thing', game.players.length);
			game.players.push(new Player(0, 0, socket.id));
			if(game.players.length == 4) {
				game.begin();
				state = findState(game);
				io.to(data).emit('state', state);
			}
		} else {
			socket.emit('thing', "too late");
		}
	});
	socket.on('turn', function(data) {
		var roomName = [];
		for (var name in socket.rooms) {
		    roomName.push(name);
		}
		console.log(roomName[1]);
		console.log(data);
		game = games.find(function(element) {
			return element.id == roomName[1];
		});
		if(socket.id == game.players[game.turn].id) {
			if(data.draw) {
				if(cantPlay(game)){
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
						io.to(roomName[1]).emit('state', state);
					} else {
						game.players[game.turn].cards.push(game.deck[0]);
						game.deck.splice(0,1);
						game.reShuffle();
						game.turn += game.turnDir;
						game.turnWrap();
						state = findState(game);
						io.to(roomName[1]).emit('state', state);
					}
				}
			} else {
				var card = null;
				card = game.players[game.turn].cards.find(function(element) {
					return element.val == data.id;
				});
				if(card != null) {
					if(card.col != game.current.col && card.type != game.current.type && card.col != 4) {
						card = null;
					} else if(card.type == 14 && !cantPlayColor()) {
						card = null;
					}
				}
				if(card != null) {
					if(card.type >= 13) {
						card.col = data.color;
					}
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
					if(data.id == game.deck[0].val && cantPlay(game)) {
						card = game.deck[0];
						game.discard.push(game.current);
						game.current = card;
						game.current.col = data.color;
						game.deck.splice(0,1);
					}
				}
				if(card != null) {
					game.turn += game.turnDir;
					game.turnWrap();
					game.cardFunctions();
					game.turnWrap();
				}
			}
		}
		state = findState(game);
		io.to(roomName[1]).emit('state', state);
	});
	socket.on('games', function(data) {
		var gameIds = [];
		for(let i = 0; i < games.length; i++) {
			if(games[i].public && games[i].players.length < 4) {
				gameIds.push(games[i].id);
			}
		}
		io.emit('games', gameIds);
	});
	socket.on('try', function(data) {
		var game = games.find(function(element) {
			return data.name == element.id;
		});
		if(game == null) {
			games.push(new Game(decodeURI(data.name).replace(/[^a-zA-Z0-9]/g, "")));
			game = games[games.length-1];
			game.public = data.public;
			io.to(socket.id).emit("confirm", true);
		} else {
			io.to(socket.id).emit("confirm", false);
		}
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

function cantPlay(game) {
	var wrong = game.players[game.turn].cards.find(function(element) {
		return element.col == 4 || element.col == game.current.col || element.type == game.current.type;
	});
	if(wrong == null) {
		return true;
	} else {
		return false;
	}
}

function cantPlayColor(game) {
	var wrong = game.players[game.turn].cards.find(function(element) {
		return element.col == game.current.col;
	});
	if(wrong == null) {
		return true;
	} else {
		return false;
	}
}