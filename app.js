const express = require('express')
var session = require('express-session');
const app = express()
const port = 3000
var { Liquid } = require('liquidjs');
var engine = new Liquid();
const path = require('path');
const bodyParser = require("body-parser");
const game = require('./game.js');
const { Player, CreateDeck } = require('./user.js');
const { Deck } = require('./cartes.js');

/*  WEBSOCKETS */
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

/*  VIEWS      */
app.engine('liquid', engine.express()); 
app.set('views', ['./views', './views/layouts']);            // specify the views directory
app.set('view engine', 'liquid');       // set liquid to default

/* RESSOURCES  */
app.use(express.static(path.join(__dirname, '/ressources')));

/* FORMS       */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* SESSIONS    */
app.use(session({secret: "Shh, its a secret!"}));

let waitingPseudo = "";
let rooms = []

function getChamber(name) {
  for (let i of rooms) {
    if (i.name == name) {
      return i;
    }
  } //TODO lors de la recherche db faire une recherche WHERE id == username
  return undefined;
}
function getChamberBySocket(socket) {
  for (let i of rooms) {
    if (i.sockets.includes(socket.id)) {
      return i;
    }
  } //TODO lors de la recherche db faire une recherche WHERE id == username
  return undefined;
}

function pioche(deck, methode) {
  if (methode == "shift")
    return deck.shift();
  return deck.pop()
}

io.on("connection", socket => {
  socket.on("wait", (arg) => {
    let room = getChamber(arg.room);
    console.log(room);
    if (room.players.length == 0) { //Si je suis le premier joueur
      room.players.push(new Player());
      // room.sockets.push(socket.id);
      socket.join(arg.room);
    }
    else if (room.players.length == 1) { //Si on est le deuxième
      room.players.push(new Player());
      // room.sockets.push(socket.id);
      socket.join(arg.room);
      io.to(arg.room).emit("both_here", arg.room); //On emit que tout le monde est là
    }
    // if (waitingPseudo == "") {
    //   waitingPseudo = arg.pseudo; //on dit que quelqu'un attends
    //   socket.join("room" + i); //on rejoint la salle;
    // } else {
    //   waitingPseudo = "" //on réinitialise
    //   socket.join("room" + i);  //on rejoint la salle
    //   io.to("room" + i).emit("both_here", "room" + i); //on emit qu'on a deux joueurs
    //   i++; //on rajoute 1 à i
    // }
  });
  socket.on("here", (arg) => {

    let room = getChamber(arg.room);
    if (room == undefined) return; //TODO res.redirect error
    if (io.sockets.adapter.rooms.get(arg.room) == undefined)
      socket.join(room.name);
    let players = Array.from(io.sockets.adapter.rooms.get(arg.room));
    if (!players.includes(socket.id)) {
      socket.join(room.name);
    }
    room.sockets.push(socket.id);
    if (room.sockets.length == 2) {
      room.players[0].getCartes();
      room.players[1].getCartes();
      room.currentlyPlaying = 0;
      io.to(room.sockets[0]).emit("begin", { pv : room.players[0].point_de_vie, cartes: room.players[0].cartes_en_main, cartes_ennemies: room.players[1].cartes_en_main, prochaine : room.players[0].deck[0] }); //tu commences
      io.to(room.sockets[1]).emit("deck", { pv : room.players[0].point_de_vie, cartes: room.players[1].cartes_en_main, cartes_ennemies: room.players[0].cartes_en_main, prochaine : room.players[1].deck[0] });
    }
    // socket.join(arg.room);
    // let players = Array.from(io.sockets.adapter.rooms.get(arg.room));
    // if (players.length == 1) {
    //   //pass
    // }
    // if (players.length == 2) {
    //   chamber = getChamber(arg.room);
    //   player = new Player(socket.id)
    //   player.getCartes();
    //   chamber.players[0].getCartes();
    //   chamber.players.push(player)//On crée un nouveau player
    //   // console.log(chamber.players[0].cartes_en_main, player.cartes_en_main)
    //   io.to(players[0]).emit("begin", { pv : player.point_de_vie, cartes: chamber.players[0].cartes_en_main, cartes_ennemies: player.cartes_en_main, prochaine : chamber.players[0].deck[0] }) //tu commences
    //   io.to(players[1]).emit("deck", { pv : player.point_de_vie, cartes: player.cartes_en_main, cartes_ennemies: chamber.players[0].cartes_en_main, prochaine : player.deck[0] }) //tu attends ton tour (on va renvoyer un emit pour créer ce player)
    // }
  })
  socket.on("skip", (arg) => {
    chamber = getChamber(arg.room);
    chamber.currentlyPlaying = (chamber.currentlyPlaying + 1) % 2
    socket.to(chamber.name).emit("your_turn");
  });

  socket.on("pose_creature", (arg) => {
    chamber = getChamber(arg.room);
    // if (socket.id == chamber.currentlyPlaying) {
    //   player = chamber.players[chamber.players.findIndex((player) => player.id==socket.id)];
    //   if (player.cartes_en_main.findIndex((carte) => carte.name == arg.carte.name) != -1) { //Si on a bien la carte en main
    //     if (Object.keys(player.monsters[arg.index]).length == 0) {
    //       player.monsters[arg.index] = arg.carte;
    //       arg.sacrifiés.forEach(carte => {
    //         player.defausse.push(carte)
    //         player.cartes_en_main.splice(carte.index, 1);
    //       });
    //       socket.to(chamber.name).emit("pose_creature", arg);
    //     }
    //   }
    // }
    let player = chamber.players[arg.id];
    player.monsters[arg.index] = arg.carte;
    arg.sacrifiés.forEach(carte => {
      player.defausse.push(carte)
      player.cartes_en_main.splice(carte.index, 1);
    });
    socket.to(chamber.name).emit("pose_creature", arg);
  });
  socket.on("pose_AC", (arg) => {
    chamber = getChamber(arg.room);
    // if (socket.id == chamber.currentlyPlaying) {
    //   player = chamber.players[chamber.players.findIndex((player) => player.id==socket.id)];
    //   if (player.cartes_en_main.findIndex((carte) => carte.name == arg.carte.name) != -1) {
    //     if (Object.keys(chamber.actions[arg.index]).length != 0) { //si on a déjà une carte action sur l'emplacement
    //       chamber.player[chamber.actions.proprietaire].defausse.push(chamber.actions[arg.index]) //on met l'ancienne dans la défausse du proprio
    //     }
    //     chamber.actions[arg.index] = arg.carte;
    //     socket.to(chamber.name).emit("pose_AC", arg);
    //   }
    // }
    player = chamber.players[arg.id];
    player.cartes_en_main.splice(carte.index, 1)
    arg.sacrifiés.forEach(carte => {
      player.defausse.push(carte)
      player.cartes_en_main.splice(carte.index, 1);
    });
    chamber.actions[arg.index] = arg.carte;
    socket.to(chamber.name).emit("pose_AC", arg)
  });

  socket.on("pose_AI", (arg) => {
    // {carte : selectedCard, sacrifiés : carteSacrifiées, room : "{{ room }}"}
    chamber = getChamber(arg.room);
    player = chamber.players[arg.id];
    player.cartes_en_main.splice(arg.carte.index, 1);
    arg.sacrifiés.forEach(carte => {
      player.defausse.push(carte)
      player.cartes_en_main.splice(carte.index, 1);
    });
    socket.to(arg.room).emit("pose_AI", arg);
  })

  socket.on("pioche", (arg) => {
    chamber = getChamber(arg.room);
    player = chamber.players[arg.id];
    if (player.cartes_en_main.length < 7) {
      if(chamber.actions.findIndex((action) => action.name == "Renouveau") != -1 && player.defausse.length > 0) {
        carte = pioche(player.defausse, "pop");
      } else {
        carte = pioche(player.deck, "shift"); //On pioche la carte dans le deck
        if (player.deck.length == 0) {
          player.deck = CreateDeck();
          player.defausse = [];
          socket.emit("new_deck", player.deck[0]);
        }
      }

      player.cartes_en_main.push(carte) //on la met dans la main
      socket.emit("pioche", {carte : carte, prochaine : player.deck[0]}) //on envoie la donnée
      socket.to(chamber.name).emit("ennemy_pioche", {carte : carte}) //On dit à l'autre qu'on a pioché
    };
  })

  socket.on("defausse", (arg) => {
    chamber = getChamber(arg.room);
    player = chamber.players[arg.target];//on get le joueur qui défausse
    if (player.cartes_en_main.length > 0) {
      player.cartes_en_main.splice(arg.index, 1) //on enlève la carte
      io.to(chamber.name).emit("defausse", arg) //On dit à l'autre qu'on a défaussé (on triera qui a défausser en front)
    }
  })

  socket.on("attack", (arg) => {
    // socket.emit("attack", {room : "{{ room }}", target : index, ref : attackingWith.index, id : my_id})
    chamber = getChamber(arg.room);
    let ennemy = chamber.players[(arg.id + 1) % 2];
    let player = chamber.players[arg.id];
    if (arg.target < 3) {
      ennemy.monsters[arg.target].pv -= player.monsters[arg.ref].attack;
      if (chamber.actions.findIndex((action) => action.name == "LuneRouge") != -1) {
          player.monsters[arg.ref].pv -= ennemy.monsters[arg.target].attack;
          if (ennemy.monsters[arg.target].name == "Faucheuse") {
              //détruit notre carte
              DestroyMonster(arg.ref, 'our', player, ennemy)
          }
          if (player.monsters[arg.ref].pv <= 0) {
              // détruit notre carte
              DestroyMonster(arg.ref, 'our', player, ennemy)
          }
      }
      if (ennemy.monsters[arg.target].pv <= 0 || player.monsters[arg.ref].name == "Faucheuse") {
          if (chamber.actions.findIndex((action) => action.name == "CheminDamne") != -1) {
              DestroyMonster(arg.ref, 'our', player, ennemy)
          }
          DestroyMonster(arg.target, 'other', player, ennemy)
      }
    } else {
        if (ennemy.monsters.findIndex((monster) => monster.name != "FideleDefenseur") == -1) {
            ennemy.point_de_vie -= player.monsters[arg.ref].attack;
            if (ennemy.point_de_vie == 0) {
                Win(socket, chamber);
            }
        }
        if (player.monsters[arg.ref].name == "Faucheuse") {// && actions.findIndex((action) => card.name == "LuneRouge") != -1
          Win(socket, chamber);
        }
    }
    socket.to(chamber.name).emit("attack", arg)
  });

  socket.on("toggle", (arg) => {
    chamber = getChamber(arg.room);
    let ennemy = chamber.players[(arg.id + 1) % 2];
    let player = chamber.players[arg.id];
    if (player.monsters.findIndex((monster) => monster.name == "RoiDeLEclipse") != -1 && ennemy.monsters.findIndex((monster) => monster.name == "FideleDefenseur") == -1){
      ennemy.point_de_vie--;
      if (ennemy.point_de_vie == 0) {
        Win(socket, chamber);
      }
    }
    let lycanthropeNuitIndex = player.monsters.findIndex((monster) => monster.name == "LycanthropeNuit");
    let lycanthropeJourIndex = player.monsters.findIndex((monster) => monster.name == "LycanthropeJour");
    if (lycanthropeJourIndex != -1){
      player.monsters[lycanthropeJourIndex] = getCorrespondante(player.monsters[lycanthropeJourIndex]);
    }
    if (lycanthropeNuitIndex != -1){
        player.monsters[lycanthropeNuitIndex] = getCorrespondante(player.monsters[lycanthropeNuitIndex]);
    }
    //du coté de l'autre
    lycanthropeNuitIndex = ennemy.monsters.findIndex((monster) => monster.name == "LycanthropeNuit");
    lycanthropeJourIndex = ennemy.monsters.findIndex((monster) => monster.name == "LycanthropeJour");
    if (lycanthropeJourIndex != -1){
      ennemy.monsters[lycanthropeJourIndex] = getCorrespondante(ennemy.monsters[lycanthropeJourIndex]);
    }
    if (lycanthropeNuitIndex != -1){
        ennemy.monsters[lycanthropeNuitIndex] = getCorrespondante(ennemy.monsters[lycanthropeNuitIndex]);
    }
    socket.to(arg.room).emit("toggle", {environnement : arg.environnement});
  })
  socket.on("eclipse", (arg) => {
    socket.to(arg.room).emit("eclipse");
  });
  socket.on("repos_final", (arg) => {
    chamber.players[0].monsters = [{}, {}, {}]
    chamber.players[1].monsters = [{}, {}, {}]
    socket.to(arg.room).emit("repos_final", arg);
  });
  socket.on("regeneration", (arg) => {
    chamber = getChamber(arg.room);
    let ennemy = chamber.players[(arg.id + 1) % 2];
    let player = chamber.players[arg.id];
    Regeneration(player, ennemy);
    socket.to(arg.room).emit("regeneration");
  });
  socket.on("reveil", (arg) => {
    chamber = getChamber(arg.room);
    chamber.actions[arg.target] = {};
    socket.to(chamber.name).emit("reveil", arg);
  });
  socket.on("agression", (arg) => {
    chamber = getChamber(arg.room);
    let ennemy = chamber.players[(arg.id + 1) % 2];
    let player = chamber.players[arg.id];
    let target = arg.target;
    if(target == 3) {
      ennemy.pv--;
    } else {
        ennemy.monsters[target].pv--;
        if (ennemy.monsters[target].pv == 0)
            DestroyMonster(target, 'other', player, ennemy);
    }
  });
  socket.on("peur", (arg) => {
    chamber = getChamber(arg.room);
    let ennemy = chamber.players[(arg.id + 1) % 2];
    ennemy.cartes_en_main.push(ennemy.monsters[arg.target]);
    ennemy.monsters[arg.target] = {}
    socket.to(chamber.name).emit("peur", arg);
  })
  socket.on("puissance_redoutable", (arg) =>{
    chamber = getChamber(arg.room);
    let player = chamber.players[arg.id];
    player.monsters[arg.target].attack += 2;
    socket.to(chamber.name).emit("puissance_redoutable", arg);
  })
  socket.on("soin", (arg) =>{
    chamber = getChamber(arg.room);
    let player = chamber.players[arg.id];
    let target = arg.target;
    let deck = Deck();
    let soin = 0;
    if (target == 3) {
      player.pv = Math.min(10, player.pv + 1);
      soin = Math.min(10, player.pv + 1);
    } else {
        original_pv = deck[deck.findIndex((carte) => carte.name == player.monsters[target].name)].pv;
        player.monsters[target].pv = Math.min(original_pv, player.monsters[target].pv + 1);
        soin = Math.min(original_pv, player.monsters[target].pv + 1);
    }
    socket.to(chamber.name).emit("soin", {target : target, pv: soin})
  });
  socket.on("lancer2tarte", (arg) => {
    socket.to(arg.room).emit("lancer2tarte", arg);
  });
  socket.on("lucidite", (arg) => {
    chamber = getChamber(arg.room);
    let player = chamber.players[arg.id];
    let target = arg.target;
    let deck = Deck();
    let soin = 0;
    if (target == 3) {
      player.pv = Math.min(10, player.pv + 1);
      soin = Math.min(10, player.pv + 1);
    } else {
      original_pv = deck[deck.findIndex((carte) => carte.name == player.monsters[target].name)].pv;
      player.monsters[target].pv = Math.min(original_pv, player.monsters[target].pv + 1);
      soin = Math.min(original_pv, player.monsters[target].pv + 1);
    }
    socket.to(chamber.name).emit("lucidite", {room : roomName, target : target, soin : soin});
  });

  socket.on('disconnecting', () => {
    let room = getChamberBySocket(socket);
    if (room != undefined) {
      rooms.splice(rooms.findIndex((chamber) => chamber.name == room.name), 1)//On détruit la salle
      io.to(room.name).emit("disconnect");
    }
  });
});

function Regeneration(player, ennemy) {
  let deck = Deck();
  player.monsters.forEach((monster) => {
      if (Object.keys(monster).length != 0) {
          let original_pv = deck[deck.findIndex((carte) => carte.name == monster.name)].pv;
          monster.pv = Math.min(original_pv, monster.pv + 2);
      }
  });
  ennemy.monsters.forEach((monster) => {
      if (Object.keys(monster).length != 0) {
          let original_pv = deck[deck.findIndex((carte) => carte.name == monster.name)].pv;
          monster.pv = Math.min(original_pv, monster.pv + 2);
      }
  });
  player.point_de_vie = Math.min(10, player.point_de_vie + 2);
  ennemy.point_de_vie = Math.min(10, ennemy.point_de_vie + 2);
}
function getCorrespondante(carte) {
  let deck = Deck();
  return deck[deck.findIndex((card) => card.name == carte.correspondante)]
}
function DestroyMonster(index, which, player, ennemy) {
  if (which == "our") {
    player.defausse.push(player.monsters[index]);
    player.monsters[index] = {};
  } else {
      ennemy.defausse.push(ennemy.monsters[index]);
      ennemy.monsters[index] = {};
  }
}

function Win(socket) {
  console.log("Win");
  socket.emit("win");
  socket.to(chamber.name).emit("lose");
}

app.get('/', (req, res) => {
  // res.render('accueil');
  res.render('accueil');
})
app.get('/home', (req, res) => {
  res.render('accueil');
})
app.get('/wait', (req, res) => {
  let room = req.query.room;
  if (getChamber(room) != undefined) {
    if (getChamber(room).players.length >= 2) {
      res.redirect(301, "/"); //TODO too much players page
      return;
    }
  } else {
    //Create the room
    rooms.push({
      name : room,
      actions : [{}, {}],
      players : [],
      sockets : []
    });
  }
  res.render('waitingRoom', {room : req.query.room});
})

app.post('/game', (req, res) => {
  res.render('game', { room : req.body.room })
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
httpServer.listen(3000, () => {
  console.log("coonect");
}); 
