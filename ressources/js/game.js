var player;
var ennemy;
var my_id = 1;
var my_turn = false;
var environnement = "blanche";
var ennemy_environnement = "noire";
var selectedCard = {
    type: ""
};
var isAttacking = false;
var attackingWith = {};
var lookingForSacrifices = false;

var turn = {
    toggle_availables: 1,
    plays_available: 1,
    reineEclipse: 0
}

var my_defausse = [];
var ennemy_defausse = [];

function beginTour() {
    console.log('begin_tour', player)
    my_turn = true;
    turn.toggle_availables = 1;
    turn.plays_available = 1;
    turn.reineEclipse = 0;
    if (actions.findIndex((action) => action.name == "Adrenaline") != -1)
    {
        turn.plays_available = 2;
    }
    Pioche()
    if (actions.findIndex((action) => action.name == "Abondance") != -1) {
        Pioche()
    }
    if (monsters.findIndex((monstre) => monstre.name == "ReinedelEclipse") != -1) {
        turn.reineEclipse = 1;
    }
    showPlayableCards(player.cartes)
}

function Pioche() {
    socket.emit("pioche", {room : roomName, id : my_id });
}

function PlayCard(card) {
    clickSoin = 0;
    clickLucid = 0;
    carte = player.cartes[card];
    if(canPlay() == false) {
        return;
    }
    if (selectedCard.name != carte.name) {//Si c'est une autre carte
        if (!lookingForSacrifices) { //Si on ne cherche pas de sacrifices
            $('.selected').removeClass("selected");
            if (carte.color == environnement) { //Si on est dans le bon coté
                if (carte.color == "noire" && carte.cout >= player.cartes.length) { //Si on a pas assez de carte à défausser
                    return
                }
                if (carte.color == "blanche" && player.cartes_ennemies.length + carte.cout > 7) {
                    //Si on fait piocher trop de carte à l'ennemis
                    return
                }
                selectedCard = carte; // on selectionne celle ci à la place
                $("#my_card" + card).addClass("selected");
                if (selectedCard.cout != 0) {
                    if (carte.color == "noire") {
                        lookingForSacrifices = true;
                        $(".cards:not(#my_card" + card + ")").addClass("possible_sacrifiés")
                    }
                }
            }
        }
        else { //Si on cherche des sacrifices
            //Si on a pas déjà séléctionné cette carte 
            if (carteSacrifiées.findIndex((sacrifiés) => sacrifiés.name == carte.name) == -1)
            {
                if (carteSacrifiées.length < selectedCard.cout) {
                    carteSacrifiées.push(carte);
                    $("#my_card" + card).removeClass("possible_sacrifiés");
                    $("#my_card" + card).addClass("sacrifiés");
                }
            } else {
                //Sinon on la déselectionne
                $("#my_card" + card).addClass("possible_sacrifiés");
                $("#my_card" + card).removeClass("sacrifiés");
                carteSacrifiées.splice(carteSacrifiées.findIndex((sacrifiés) => sacrifiés.name == carte.name), 1);
            }
        }
    } else {//Si c'est la même 
        if (lookingForSacrifices == false) { //Si on déselectionne une carte qui ne demande pas de sacrifices
            ResetSelection();
        } else {
            ResetSelection();
            lookingForSacrifices = false;
            $(".possible_sacrifiés").removeClass("possible_sacrifiés");
            $(".sacrifiés").removeClass("sacrifiés");
            carteSacrifiées = [];
        }
    }
}

function LogCarte(card) {
    if (isAttacking && jQuery.isEmptyObject(attackingWith) == false) { //Si on attaque et qu'on a selectionné un monstre
        if (jQuery.isEmptyObject(ennemyMonsters[attackingWith.index]) == false) {
            Attack(3);
        }
    }
}

let monsters = [{}, {}, {}];
let ennemyMonsters = [{}, {}, {}]
let actions = [{}, {}];
let carteSacrifiées = [];
function PoseCreature(emplacement) {
    // console.log(selectedCard, '<div class="cards cartes" id="my_card' + selectedCard.index + '" onclick="PlayCard(' + selectedCard.index + ')">' + selectedCard.name + '<img src="/imgs/cartes/ReinedelEclipse.png" /></div>')
    let index = selectedCard.index;
    if (selectedCard.type  != "Creature") {
        return
    }
    if (jQuery.isEmptyObject(monsters[emplacement])) { //s'il n'y a pas de monstre sur cet emplacement
        selectedCard.has_attacked = true;
        monsters[emplacement] = selectedCard;
        effects[selectedCard.effect]();
        socket.emit("pose_creature", {id : my_id, carte : selectedCard, index : emplacement, sacrifiés : carteSacrifiées, room : roomName})
        //mettre la carte dans l'emplacement avec #monster + emplacement .img.url = img;
        $("#monster" + (emplacement + 1) + " img")[0].src = "/imgs/cartes/" + selectedCard.name + ".png";
        //désincrémente l'action
        if(actions.findIndex((action) => action.name == "DoubleSoleil") != -1) { //S'il y a double soleil
            temp = monsters[emplacement].attack; monsters[emplacement].attack = monsters[emplacement].pv; monsters[emplacement].pv = temp;
            //On inverse les pv et l'attaque 
        }
        playingCreatureSound.play();
        Played(index)
    }
}

function PoseActionContinue(emplacement) {
    selectedCard.proprietaire = my_id;
    if (jQuery.isEmptyObject(actions[emplacement]) == false) {
        if (actions[emplacement].proprietaire == my_id) {
            my_defausse.push(actions[emplacement])
            $("#my_top_defausse")[0].src = "/imgs/cartes/" + actions[emplacement].name + ".png";
        } else {
            my_defausse.push(actions[emplacement])
            $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + actions[emplacement].name + ".png";
        }
    }
    if (actions[emplacement].name == "DoubleSoleil") {
        DoubleSoleil();
    }
    actions[emplacement] = selectedCard;
    socket.emit("pose_AC", {id : my_id, carte : selectedCard, index : emplacement, sacrifiés : carteSacrifiées, room : roomName})
    //mettre la carte dans l'emplacement
    $("#action" + (emplacement + 1) + " img")[0].src = "/imgs/cartes/" + selectedCard.name + ".png";
    // effect[selectedCard.effet]();
    effects[selectedCard.effect]();
    if (selectedCard.name=="Adrenaline") {
        turn.plays_available++;
    }
    playingACSound.play();
    Played(selectedCard.index)
}
function PoseAi(target) {
    //TODO faire le call socket
    //la mettre dans la defausse
    //effectuer l'effet
    //TODO faire le message "le joueur a joué une action"
    console.log(target, selectedCard)
    socket.emit("pose_AI", {carte : selectedCard, sacrifiés : carteSacrifiées, room : roomName, id: my_id});
    switch (selectedCard.name) {
        case "EclipseBlanche":
        case "EclipseNoire":
            Eclipse();
            socket.emit("eclipse", { room : roomName});
            break;
        case "Oubli":
            defausse();
            break;
        case "ReposFinal":
            ReposFinal();
            socket.emit("repos_final", { room : roomName});
            break;
        case "BonConseil":
            carteSup2();
            break;
        case "MomentDeCalme":
            cartePioche();
            cartePioche();
            break;
        case "Regeneration":
            Regeneration();
            socket.emit("regeneration", { room : roomName, id : my_id});
            break;
        case "Agression":
            if(target == 3) {
                ennemy.pv--;
            } else {
                ennemyMonsters[target].pv--;
                if (ennemyMonsters[target].pv == 0)
                    DestroyMonster(target, 'other');
            }
            socket.emit("agression", { room : roomName, target: target, id:my_id})
            break;
        case "Reveil":
            actions[target] = {};
            $("#action" + (target + 1) + " img")[0].src = "/imgs/carte_vide.png";
            socket.emit("reveil", {room : roomName, target : target})
            break;
        case "Peur":
            player.cartes_ennemies.push(Deck[Deck.findIndex((carte) => carte.name == ennemyMonsters[target].name)])
            ennemyMonsters[target] = {};
            $("#ennemy_monster" + (target + 1)+ " img")[0].src="/imgs/carte_vide.png";
            socket.emit("peur", {room : roomName, target : target, id: my_id});
            $(".cards").remove();
            $(".ennemy_cards").remove();
            feedHand(player.cartes, player.cartes_ennemies);
            break;
        case "PuissanceRedoutable":
            if (jQuery.isEmptyObject(monsters[target]) == false){
                monsters[target].attack += 2;
            }
            socket.emit("puissance_redoutable", {room : roomName, target : target, id: my_id});
            break;
        case "Soin":
            if (target == 3) {
                player.pv = Math.min(10, player.pv + 1);
            } else {
                original_pv = Deck[Deck.findIndex((carte) => carte.name == monsters[target].name)].pv;
                monsters[target].pv = Math.min(original_pv, monsters[target].pv + 1);
            }
            socket.emit("soin", {room : roomName, target : target, id:my_id});
            break;
        case "LancerDeTarte":
            socket.emit("lancer2tarte", {room : roomName, target : target});
            break;
        case "Lucidite":
            Lucidite(target);
        default:
            break;
    }
    my_defausse.push(selectedCard);
    $("#my_top_defausse")[0].src = "/imgs/cartes/" + selectedCard.name + ".png";
    playingAISound.play();
    Played(selectedCard.index)
}

function setAttackingWith(index) {
    if (canAttack(monsters[index]))
    {
        $(".selected").removeClass("selected");
        attackingWith = monsters[index];
        attackingWith.index = index;
        $("#monster" + (index + 1)).addClass("selected");
        showPlayableCards(player.carte);
    }
}

function Attack(index) {
    creatureAttackingSound.play();
    if (index < 3) {
        ennemyMonsters[index].pv -= monsters[attackingWith.index].attack;
        if (actions.findIndex((action) => action.name == "LuneRouge") != -1) {
            monsters[attackingWith.index].pv -= ennemyMonsters[index].attack;
            if (ennemyMonsters[index].name == "Faucheuse") {
                //détruit notre carte
                DestroyMonster(attackingWith.index, 'our')
            }
            if (monsters[attackingWith.index].pv <= 0) {
                // détruit notre carte
                DestroyMonster(attackingWith.index, 'our')
            }
        }
        //TODO annim
        //TODO mettre à jour les graph
        if (ennemyMonsters[index].pv <= 0 || monsters[attackingWith.index].name == "Faucheuse") {
            if (actions.findIndex((action) => action.name == "CheminDamne") != -1) {
                //détruit notre carte
                DestroyMonster(attackingWith.index, 'our')
            }
            //detruit ennemy_monster
            DestroyMonster(index, 'other')
            //va dans la défausse
        }
    } else {
        if (ennemyMonsters.findIndex((monster) => monster.name == "FideleDefenseur") == -1) {
            ennemy.pv -= monsters[attackingWith.index].attack;
            if (ennemy.pv == 0) {
                console.log("gagné !");
            }
        }
        // if (ennemyMonsters[index].name == "Faucheuse" && actions.findIndex((action) => card.name == "LuneRouge") != -1) {
        //     console.log("gameover");
        // }
        if (monsters[attackingWith.index].name == "Faucheuse") {// && actions.findIndex((action) => card.name == "LuneRouge") != -1
            console.log("gagné");
        }
    }
    socket.emit("attack", {room : roomName, target : index, ref : attackingWith.index, id : my_id});
    if (jQuery.isEmptyObject(monsters[attackingWith.index]) == false)
        monsters[attackingWith.index].has_attacked = true;
    attackingWith = {};
    $(".selectionnable").removeClass("selectionnable");
    $(".selected").removeClass("selected");
    showPlayableCards(player.cartes);
}

function DestroyMonster(index, which) {
    console.log("destroying", which, index)
    if (which == "our") {
        my_defausse.push(monsters[index]);
        $("#my_top_defausse")[0].src = "/imgs/cartes/" + monsters[index].name + ".png";
        monsters[index] = {};
        $("#monster" + (index + 1) + " img")[0].src= "/imgs/carte_vide.png";
    } else {
        $("#ennemy_monster" + (index + 1)+ " img")[0].src="/imgs/carte_vide.png";
        $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + ennemyMonsters[index].name + ".png";
        ennemyMonsters[index] = {};
        // faire le call socket
    }
    destroyingMonsterSound.play();
}

function Played(index) {
    player.cartes.splice(index, 1);
    ResetSelection();
    $(".possible_sacrifiés").removeClass("possible_sacrifiés");
    $(".sacrifiés").removeClass("sacrifiés");
    $("#my_card" + index).remove();
    $(".selectionnable").removeClass('selectionnable');
    carteSacrifiées.forEach(carte => {
        $("#my_card" + carte.index).remove()
        my_defausse.push(carte);
        $("#my_top_defausse")[0].src = "/imgs/cartes/" + carte.name + ".png";
        player.cartes.splice(carte.index, 1)
    });
    carteSacrifiées = [];
    lookingForSacrifices = false;
    if (turn.reineEclipse == 0){
        turn.toggle_availables--; //On enlève la possibilité de switcher
    } else {
        turn.reineEclipse = 0 //a part s'il y a la reineEclipse
    }
    turn.plays_available--; //On enlève un tour
    $(".cards").remove();
    $(".ennemy_cards").remove();
    feedHand(player.cartes, player.cartes_ennemies);
    showPlayableCards(player.cartes)
}

const socket = io();

// var soundNuitLoaded = false
// NuitSound.once('load', function(){
//     soundNuitLoaded = true;
// });
// var jourSoundLoaded = false
// jourSound.once('load', function(){
//     jourSoundLoaded = true;
// });

//TODO jquery onload

// var jourSound = new Howl({
//     src: ['/musics/Life.mp3'],
//     loop: true,
// });
// var NuitSound = new Howl({
//     src: ['/musics/Death.mp3'],
//     loop: true,
// });

var jourSound;
var nuitSound;
var switchingSound;
var destroyingMonsterSound;
var endingTurnSound;
var playingACSound;
var playingAISound;
var playingCreatureSound;
var creatureAttackingSound;
var loseSound;
var winSound;
$( document ).ready(function() {
    jourSound = new Howl({
        src: ['/musics/Life.mp3'],
        loop: true,
        onplayerror: function() {
            jourSound.once('unlock', function() {
              sound.play();
            });
        }
    });
    jourSound.once('load', () => {
        nuitSound = new Howl({
            src: ['/musics/Death.mp3'],
            loop: true,
            onplayerror: function() {
                nuitSound.once('unlock', function() {
                  sound.play();
                });
            }
        });
        nuitSound.once('load', () => {
            socket.emit("here", { room :roomName}); 
        });
    })
    switchingSound = new Howl({
        src: ['/musics/switching.mp3'],
        loop: false,
    });
    destroyingMonsterSound = new Howl({
        src: ['/musics/destroying_monster.mp3'],
        loop: false,
    });
    endingTurnSound = new Howl({
        src: ['/musics/ending_turn.mp3'],
        loop: false,
    });
    playingACSound = new Howl({
        src: ['/musics/playing_AC.mp3'],
        loop: false,
    });
    playingAISound = new Howl({
        src: ['/musics/playing_AI.mp3'],
        loop: false,
    });
    playingCreatureSound = new Howl({
        src: ['/musics/playing_creature.mp3'],
        loop: false,
    });
    creatureAttackingSound = new Howl({
        src: ['/musics/creature_attacking.mp3'],
        loop: false,
    });
    winSound = new Howl({
        src: ['/musics/Victory.mp3'],
        loop: false,
    });
    loseSound = new Howl({
        src: ['/musics/Defeat.mp3'],
        loop: false,
    });
});

socket.on('deck', function(arg) {
    player = arg;
    ennemy = {
        pv : 10
    }
    environnement = "noire";
    ennemy_environnement = "blanche";
    feedHand(arg.cartes, arg.cartes_ennemies)
    $("main").css("background-image", "url(/imgs/plateau/nuit.jpg)")
    console.log("je joue en second")
    nuitSound.play();
    // NuitSound.play()
})

socket.on('begin', function(arg) {
    player = arg;
    ennemy = {
        pv : 10
    }
    my_id = 0;
    my_turn = true;
    feedHand(arg.cartes, arg.cartes_ennemies)
    console.log("Je commence");
    jourSound.play();
    setTimeout(() => {
        beginTour();
    }, 500);
    // jourSound.play();
});

socket.on("pose_creature", function(arg) {
    ennemyMonsters[arg.index] = arg.carte;
    if(actions.findIndex((action) => action.name == "DoubleSoleil") != -1) { //S'il y a double soleil
        temp = ennemyMonsters[arg.index].attack; 
        ennemyMonsters[arg.index].attack = ennemyMonsters[arg.index].pv; 
        ennemyMonsters[arg.index].pv = temp;
        //On inverse les pv et l'attaque 
    }
    $("#ennemy_monster" + (arg.index + 1) + " img")[0].src = "imgs/cartes/" + arg.carte.name + ".png";
    $("#ennemy_card" + arg.carte.index).remove();
    player.cartes_ennemies.splice(arg.carte.index, 1);
    arg.sacrifiés.forEach((carte) => {
        player.cartes_ennemies.splice(carte.index, 1); //On enlève les cartes sacrifiées js
        $("#ennemy_card" + carte.index).remove(); // et en apparance
        // Et on rajoute ça dans la défausse
        ennemy_defausse.push(carte);
        $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + carte.name + ".png";
    });
    if (arg.carte.color == "blanche") {
        for (let i = 0; i < arg.carte.cout; i++) {
            Pioche();
        }
    }
    playingCreatureSound.play();
})
socket.on("pose_AC", function(arg) {
    if (actions[arg.index].proprietaire == my_id) {
        my_defausse.push(actions[arg.index]);
        $("#my_top_defausse")[0].src = "/imgs/cartes/" + carte.name + ".png";
    }
    actions[arg.index] = arg.carte;
    $("#action" + (arg.index + 1) + " img")[0].src = "imgs/cartes/" + arg.carte.name + ".png";
    $("#ennemy_card" + arg.carte.index).remove();
    player.cartes_ennemies.splice(arg.carte.index, 1);
    arg.sacrifiés.forEach((carte) => {
        player.cartes_ennemies.splice(carte.index, 1); //On enlève les cartes sacrifiées js
        $("#ennemy_card" + carte.index).remove();
        ennemy_defausse.push(carte);
        $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + carte.name + ".png";
    })
    if (arg.carte.color == "blanche") {
        for (let i = 0; i < arg.carte.cout; i++) {
            Pioche();
        }
    }
    playingACSound.play();
})
socket.on("pose_AI", function(arg) {
    $("#ennemy_card" + arg.carte.index).remove();
    player.cartes_ennemies.splice(arg.carte.index);
    arg.sacrifiés.forEach((carte) => {
        player.cartes_ennemies.splice(carte.index, 1); //On enlève les cartes sacrifiées js
        $("#ennemy_card" + carte.index).remove();
        ennemy_defausse.push(carte);
        $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + carte.name + ".png";
    })
    if (arg.carte.color == "blanche") {
        for (let i = 0; i < arg.carte.cout; i++) {
            Pioche();
        }
    }
    playingAISound.play()
});

socket.on("pioche", (arg) => {
    if(actions.findIndex((action) => action.name == "Renouveau") != -1 && my_defausse.length > 0)
    {
        my_defausse.pop();
        let img = "/imgs/carte_vide.png";
        if (my_defausse.length > 0) {
            img = "/imgs/cartes/" + my_defausse[my_defausse.length - 1].name + ".png"
        }
            
        $("#my_top_defausse")[0].src = img;
    }
    player.cartes.push(arg.carte);
    $(".cards").remove();
    $(".ennemy_cards").remove();
    feedHand(player.cartes, player.cartes_ennemies);
    $("#prochaine")[0].src = "/imgs/cartes/" + arg.prochaine.name + ".png";
})

socket.on("defausse", (arg) => {
    if (arg.target == my_id)
    {
        my_defausse.push(player.cartes.splice(arg.index, 1)[0]);
        $("#my_top_defausse")[0].src = "/imgs/cartes/" + my_defausse[my_defausse.length - 1].name + ".png";

    } else {
        ennemy_defausse.push(player.cartes_ennemies.splice(arg.index, 1)[0]);
        $("#ennemy_top_defausse")[0].src = "/imgs/cartes/" + ennemy_defausse[ennemy_defausse.length - 1].name + ".png";
    }
    $(".cards").remove();
    $(".ennemy_cards").remove();
    feedHand(player.cartes, player.cartes_ennemies);
})

socket.on("ennemy_pioche", (arg) => {
    player.cartes_ennemies.push(arg.carte);
    $(".cards").remove();
    $(".ennemy_cards").remove();
    feedHand(player.cartes, player.cartes_ennemies);
});

socket.on("attack", (arg) => {
    creatureAttackingSound.play()
    // socket.emit("attack", {room : roomName, target : index, ref : attackingWith.index, id : my_id}) //reference pour les noms
    if (arg.target < 3) {
        let index = arg.target;
        monsters[index].pv -= ennemyMonsters[arg.ref].attack;
        if (actions.findIndex((action) => action.name == "LuneRouge") != -1) { //Si on réplique
            ennemyMonsters[arg.ref].pv -= monsters[index].attack; //on baisse les pv
            if (monsters[arg.ref].name == "Faucheuse") { //on tue meme si on est la faucheuse
                //détruit la carte de l'adversaire
                DestroyMonster(arg.ref, 'other')
            }
            if (ennemyMonsters[arg.ref].pv <= 0) { //si l'adversaire tombe à 0
                // détruit sa carte
                DestroyMonster(arg.ref, 'other')
            }
        }
        if (monsters[index].pv <= 0 || ennemyMonsters[arg.ref].name == "Faucheuse") {
            if (actions.findIndex((action) => action.name == "CheminDamne") != -1) {
                //détruit notre carte
                DestroyMonster(arg.ref, 'other')
            }
            DestroyMonster(index, 'our')
            //va dans la défausse
        }
    } else {
        if (monsters.findIndex((monster) => monster.name == "FideleDefenseur") == -1) {
            player.pv -= ennemyMonsters[arg.ref].attack;
            if (player.pv == 0) {
                console.log("perdu !");
            }
        }
        if (ennemyMonsters[arg.ref].name == "Faucheuse") {// && actions.findIndex((action) => card.name == "LuneRouge") != -1
            console.log("gameover");
        }
    }
});

socket.on("toggle", (arg) => {
    $(".cards").remove();
    $(".ennemy_cards").remove();
    ennemy_environnement = arg.environnement;
    if (ennemyMonsters.findIndex((monster) => monster.name == "RoiDeLEclipse") != -1 && monsters.findIndex((monster) => monster.name == "FideleDefenseur") == -1){
        player.pv--;
        if (player.pv == 0) {
          console.log("perdu !");
        }
    }
    toggleLycanthrope();

    feedHand(player.cartes, player.cartes_ennemies);
})

socket.on("your_turn", () => {
    console.log("skipped")
    my_turn = true;
    showPlayableCards(player.cartes)
    beginTour()
    //TODO toute la stylisation
})

socket.on("error", () => {
    console.log("error");
    //TODO jouer l'erreur
    //TODO peut etre le type de l'erreur ?
})

// SECTION socket.on carte action immédiate !
socket.on("eclipse", (arg) => {
    Eclipse();
})
socket.on("repos_final", (arg) => {
    ReposFinal();
})
socket.on("regeneration", (arg) => {
    Regeneration();
})
socket.on("reveil", (arg) => {
    actions[arg.target] = {};
    $("#action" + (arg.target + 1) + " img")[0].src = "/imgs/carte_vide.png";
})
socket.on("peur", (arg) => {
    let target = arg.target;
    player.cartes.push(Deck[Deck.findIndex((carte) => carte.name == monsters[target].name)])
    monsters[target] = {};
    $("#monster" + (target + 1)+ " img")[0].src="/imgs/carte_vide.png";
    $(".cards").remove();
    $(".ennemy_cards").remove();
    feedHand(player.cartes, player.cartes_ennemies);
})
socket.on("puissance_redoutable", (arg) => {
    ennemyMonsters[arg.target].attack += 2;
})
socket.on("soin", (arg) => {
    if (arg.target == 3) {
        ennemy.pv = arg.pv;
    } else {
        ennemyMonsters[arg.target].pv = arg.pv;
    }
});
socket.on("lucidite", (arg) => {
    let target = arg.target;
    if (target == "player") {
        ennemy.pv = arg.soin;
    } 
    else if (target < 3) {
        ennemyMonsters[target].pv = arg.soin
    }
});
socket.on("lancer2tarte", (arg) => {
    monsters[arg.target].has_attacked = true;
});

socket.on("agression", (arg) => {
    if(arg.target == 3) {
        player.pv--;
    } else {
        monsters[arg.target].pv--;
        if (monsters[arg.target].pv == 0)
            DestroyMonster(arg.target, 'our');
    }
});

socket.on("win", (arg) => {
    console.log("J'ai gagné !");
    jourSound.stop();
    nuitSound.stop();
    winSound.play();
    $("#win").css("z-index", 1)
})

socket.on("lose", (arg) => {
    console.log("J'ai perdu !");
    jourSound.stop();
    nuitSound.stop();
    loseSound.play();
    $("#lose").css("z-index", 1)
})

socket.onAny((eventName, ...args) => {
    console.log(eventName, args)
  });