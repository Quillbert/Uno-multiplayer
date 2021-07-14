var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000);
const Game = require("./game.js");
const Player = require("./player.js");
app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   next();
}) 
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
			if(game.started) {
				io.to(game.id).emit('oops', "d");
				for(let i = 0; i < games.length; i++) {
					if(games[i] == game) {
						games.splice(i,1);
					}
				}
			} else {
				for(let i = 0; i < game.players.length; i++) {
					if(game.players[i].id == socket.id) {
						game.players.splice(i,1);
						io.to(game.id).emit('player-count', game.players.length);
						for(let i = 0; i < game.players.length; i++) {
							io.to(game.players[i].id).emit('assign', i);
						}
					}
				}
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
			var out  = {
				playerNum: game.players.length,
				forcePlay: game.forcePlay
			}
			io.to(socket.id).emit('thing', out);
			game.players.push(new Player(0, 0, socket.id));
			if(game.players.length == 4) {
				game.begin();
				sendData(game);
			}
			io.to(data).emit('player-count', game.players.length);
		} else {
			socket.emit('thing', "too late");
		}
	});
	socket.on('begin', function(data) {
		var roomName = [];
		for (var name in socket.rooms) {
		    roomName.push(name);
		}
		console.log(roomName[1]);
		console.log(data);
		game = games.find(function(element) {
			return element.id == roomName[1];
		});
		if(socket.id == game.players[0].id && !game.started && game.players.length >= 2) {
			game.begin();
			sendData(game);
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
			for(let i = 0; i < game.players.length; i++) {
				game.players[i].uno = false;
			}
			game.players[game.turn].uno = data.uno;
			if(data.draw) {
				if(game.stackCount > 0) {
					game.acceptFate();
				} else if(game.cantPlay() || !game.forcePlay){
					if((game.current.col == game.deck[0].col || game.current.type == game.deck[0].type) && !data.keep) {
						game.discard.push(game.current);
						game.current = game.deck[0];
						game.deck.splice(0,1);
						game.previous = game.turn;
						game.turn += game.turnDir;
						game.turnWrap();
						game.cardFunctions();
						game.turnWrap();
						game.reShuffle();
						sendData(game);
					} else {
						game.players[game.turn].cards.push(game.deck[0]);
						game.deck.splice(0,1);
						game.reShuffle();
						game.previous = game.turn;
						game.turn += game.turnDir;
						game.turnWrap();
						sendData(game);
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
					} else if(card.type == 14 && !game.cantPlayColor() && game.stackCount <= 0 && game.forcePlay) {
						card = null;
					} else if(card.type > 12 && data.col == 4) {
						card = null;
					} else if(card.type != game.current.type && game.stackCount > 0) {
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
					if(data.id == game.deck[0].val && (game.cantPlay() || !game.forcePlay)) {
						card = game.deck[0];
						game.discard.push(game.current);
						game.current = card;
						game.current.col = data.color;
						game.deck.splice(0,1);
					}
				}
				if(card != null) {
					game.previous = game.turn;
					game.turn += game.turnDir;
					game.turnWrap();
					game.cardFunctions();
					game.turnWrap();
				}
			}
		}
		sendData(game);
	});
	socket.on('games', function(data) {
		var gameIds = [];
		for(let i = 0; i < games.length; i++) {
			if(games[i].public && !games[i].started) {
				var s = games[i].id;
				if(games[i].stacking && games[i].forcePlay) {
					s = s.concat("[s,f]");
				} else if(games[i].stacking) {
					s = s.concat("[s]");
				} else if(games[i].forcePlay) {
					s = s.concat("[f]");
				}
				gameIds.push(s);
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
			game.stacking = data.stacking;
			game.forcePlay = data.forcePlay;
			io.to(socket.id).emit("confirm", true);
		} else {
			io.to(socket.id).emit("confirm", false);
		}
	});
	socket.on('uno', function(data) {
		var game = games.find(function(element) {
			return data.name = element.id;
		});
		if(game.players[game.previous].cards.length == 1 && !game.players[game.previous].uno) {
			if(socket.id == game.players[game.previous].id) {
				game.players[game.previous].uno = true;

				console.log("here");
			} else {
				game.turn = game.previous;
				game.forceDraw(2);
				game.turn += game.turnDir;
				game.turnWrap();
				game.players[game.previous].uno = true;
				console.log("here2");
			}
			sendData(game);
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
		uno: [],
		stackCount: game.stackCount,
		previous: game.previous
	};
	for(let i = 0; i < game.players.length; i++) {
		var hand = {
			ids: []
		}
		for(let j = 0; j < game.players[i].cards.length; j++) {
			hand.ids.push(game.players[i].cards[j].val);
		}
		out.hands.push(hand);
		out.uno.push(game.players[i].uno);
	}
	return out;
}
function sendData(game) {
	for(let i = 0; i < game.players.length; i++) {
		var playerData = findState(game);
		for(let j = 0; j < playerData.hands.length; j++) {
			if(j != i) {
				for(let k = 0; k < playerData.hands[j].ids.length; k++) {
					playerData.hands[j].ids[k] = -1;
				}
			}
		}
		io.to(game.players[i].id).emit('state', playerData);
	}
}