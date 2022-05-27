var DoubleSoleil = function() {
    monsters.forEach((monster) => { 
        if (jQuery.isEmptyObject(monster) == false) {
        temp = monster.attack; monster.attack = monster.pv; monster.pv = temp
        } 
    });
    ennemyMonsters.forEach((monster) => { 
        if (jQuery.isEmptyObject(monster) == false) {
        temp = monster.attack; monster.attack = monster.pv; monster.pv = temp
        } 
    });
}

var carteSup = function() {
    turn.plays_available++;
}

var carteSup2 = function() {
    turn.plays_available++;
    turn.plays_available++;
}

var cartePioche = function() {
    Pioche();
}

var defausse2 = function() {
    let randId = Math.floor(Math.random() * player.cartes_ennemies.length);
    socket.emit("defausse", {target : (my_id + 1) % 2, index: randId, room : roomName });
    randId =  Math.floor(Math.random() * player.cartes_ennemies.length - 1);
    socket.emit("defausse", {target : (my_id + 1) % 2, index: randId, room : roomName });
}

var defausse = function() {
    let randId = Math.floor(Math.random() * player.cartes_ennemies.length);
    socket.emit("defausse", {target : (my_id + 1) % 2, index: randId, room : roomName });
}

var ReposFinal = function() {
    for (let i = 0; i < 3; i++) {
        if(jQuery.isEmptyObject(ennemyMonsters[i]) == false) {
            DestroyMonster(i, 'other')
        }
        if (jQuery.isEmptyObject(monsters[i]) == false) {
            DestroyMonster(i, 'our')
        }    
    }
}

var Eclipse = function() {
    turn.reineEclipse++;
    if (my_turn == false) {
        my_turn = true;
        ToggleDay();
        my_turn = false;
    } else {
        ToggleDay();
    }

}

var noEffect = function () {
    return
}

var Regeneration = function() {
    monsters.forEach((monster) => {
        if (jQuery.isEmptyObject(monster) == false) {
            let original_pv = Deck[Deck.findIndex((carte) => carte.name == monster.name)].pv;
            monster.pv = Math.min(original_pv, monster.pv + 2);
        }
    });
    ennemyMonsters.forEach((monster) => {
        if (jQuery.isEmptyObject(monster) == false) {
            let original_pv = Deck[Deck.findIndex((carte) => carte.name == monster.name)].pv;
            monster.pv = Math.min(original_pv, monster.pv + 2);
        }
    });
    player.pv = Math.min(10, player.pv + 2);
    ennemy.pv = Math.min(10, ennemy.pv + 2);
}

function Lucidite(target) {
    console.log(target);
    if (target == 3) {
        player.pv = Math.min(10, player.pv + 1);
    } 
    else if (target < 3) {
        original_pv = Deck[Deck.findIndex((carte) => carte.name == monsters[target].name)].pv;
        monsters[target].pv = Math.min(original_pv, monsters[target].pv + 1);
    }
    Pioche();
    turn.plays_available++;
    socket.emit("lucidite", {room : roomName, target : target, id : my_id});
}

var effects = {
    "doubleSoleil" : DoubleSoleil,
    "noEffect": noEffect,
    "noeffect": noEffect,
    "carteSup" : carteSup,
    "cartePioche" : cartePioche,
    "carteSup2" : carteSup2,
    "defausse2" : defausse2,
}