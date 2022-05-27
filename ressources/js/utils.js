function Skip() {
    ResetSelection();
    if (my_turn) {
        if (monsters.findIndex((monster) => monster.name == "RoiDeLEclipse") != -1 && ennemyMonsters.findIndex((monster) => monster.name == "FideleDefenseur") == -1){
            ennemy.pv--;
            if (ennemy.pv == 0) {
              console.log("gagné");
            }
        }
        if (isAttacking) {
            turn.plays_available = 0;
            turn.reineEclipse = 0;
            turn.toggle_availables = 0;
            isAttacking = false;
            ResetSelection()
            $(".selectionnable").removeClass("selectionnable");
            $("selected").removeClass("selected");
            monsters.forEach(monster => {
                if (!jQuery.isEmptyObject(monster)){
                    monster.has_attacked = false;
                }
            });
            my_turn = false;
            console.log("skipping");
            socket.emit("skip", { room :roomName});
        } else {
            isAttacking = true;
            turn.toggle_availables = 0;
            turn.plays_available = 0;
            turn.reineEclipse = 0;
            showPlayableCards(player.cartes);
            console.log("attacking")
        }
    } else {
        //TODO animation que tu peux pas skip
        console.log("no-skip")
    }
}

function ResetSelection() {
    selectedCard = {
        type: ""
    }
    $(".selected").removeClass("selected");
}

function showPlayableCards(cartes) {
    if(canPlay() == false) {
        //On va aller chercher tous les monstres et les rendre selectionnables
        if (isAttacking) {
            let i = 1
            monsters.forEach(monster => {
               if(canAttack(monster)) {
                    $("#monster" + i).addClass("selectionnable");
               }
               i++; 
            });
            if (jQuery.isEmptyObject(attackingWith) == false) {
                let j = attackingWith.index;
                if (jQuery.isEmptyObject(ennemyMonsters[j])) {
                    //Sur les cotés ou l'ennemie
                    if (j == 0) {
                        $("#ennemy_monster2").addClass("selectionnable")
                    }
                    if (j == 1) {
                        $("#ennemy_monster1").addClass("selectionnable")
                        $("#ennemy_monster3").addClass("selectionnable")
                    }
                    if (j == 2) {
                        $("#ennemy_monster2").addClass("selectionnable")
                    }
                    $("#ennemy_div").addClass("selectionnable")

                } else {
                    $("#ennemy_monster" + (j + 1)).addClass("selectionnable")
                }
            }
        }
        endingTurnSound.play();
        return;
    }
    $(".cards").each(function(index, value) {
        carte = cartes[index];
        if (carte.color == environnement) { //Si on est dans le bon coté
            if (carte.color == "noire" && carte.cout >= player.cartes.length) { //Si on a pas assez de carte à défausser
                return
            }
            if (carte.color == "blanche" && player.cartes_ennemies.length + carte.cout > 7) {
                //Si on fait piocher trop de carte à l'ennemis
                return
            }
            $("#my_card" + index).addClass("selectionnable");
        }
    });
}

function canPlay() {
    if (turn.plays_available > 0 && my_turn)
        return true;
    return false;
}

function canAttack(monster) {
    if (jQuery.isEmptyObject(monster) || (monster.name == "ArbreMaudit" && environnement =="blanche") || monster.has_attacked) {
        return false;
    }
    return true;
}

function feedHand(cartes, cartes_ennemies) {
    let i = 0;
    cartes.forEach(carte => {
        if (carte.color != environnement) {
            carte = getCorrespondante(carte);
            player.cartes[i] = carte;
        }
        carte.index = i;
        $("#card_div").append('<div class="cards cartes" id="my_card' + i + '" onclick="PlayCard(' + i + ')"><img src="/imgs/cartes/' + carte.name + '.png" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top" /></div>');
        i++;
    });
    i = 0;
    cartes_ennemies.forEach(carte => {
        if (carte.color == ennemy_environnement) {
            carte = getCorrespondante(carte);
            player.cartes_ennemies[i] = carte;
        }
        carte.index = i;
        $("#ennemy_div").append('<div class="ennemy_cards cartes" id="ennemy_card' + i + '" onclick="LogCarte(' + i + ')"><img src="/imgs/cartes/' + carte.name + '.png" data-bs-toggle="tooltip" data-bs-placement="top" title="Tooltip on top" /></div>'); 
        i++;
    });
    enableTooltip();
    showPlayableCards(cartes);
}

function ToggleDay()
{
    if (my_turn) {
        $("#toggle")[0].style.top = "0px"
        setTimeout(function() {
            $("#toggle")[0].style.top = "-2em"
        }, 500);
        if (turn.toggle_availables > 0 || turn.reineEclipse > 0)
        {
            switchingSound.play();
            if (environnement == "noire")
            {
                environnement = "blanche"
                $("main").css("background-image", "url(/imgs/plateau/jour.jpg)");
                $(".cards").remove();
                $(".ennemy_cards").remove();
                feedHand(player.cartes, player.cartes_ennemies);
                socket.emit("toggle", { room :roomName, environnement : "blanche", id: my_id})
                nuitSound.fade(1.0, 0, 500);
                jourSound.play();
            }
            else if (environnement == "blanche")
            {
                environnement = "noire";
                $(".cards").remove();
                $(".ennemy_cards").remove();
                feedHand(player.cartes, player.cartes_ennemies);
                $("main").css("background-image", "url(/imgs/plateau/nuit.jpg)")
                socket.emit("toggle", { room :roomName, environnement : "noire", id: my_id})
                jourSound.fade(1.0, 0, 500);
                nuitSound.play();
            }
            if (turn.reineEclipse > 0) {
                turn.reineEclipse--;
                toggleLycanthrope();
                $(".selectionnable").removeClass("selectionnable");
                $(".selected").removeClass("selected");
                $(".possible_sacrifiés").removeClass("possible_sacrifiés");
                $(".sacrifiés").removeClass("sacrifiés");
                showPlayableCards(player.cartes)  
                return
            }
            turn.plays_available--;
            turn.toggle_availables--;
            toggleLycanthrope();
        }
        $(".selectionnable").removeClass("selectionnable");
        $(".selected").removeClass("selected");
        $(".possible_sacrifiés").removeClass("possible_sacrifiés");
        $(".sacrifiés").removeClass("sacrifiés");
        showPlayableCards(player.cartes)             
    }
}

function toggleLycanthrope() {
    let lycanthropeNuitIndex = monsters.findIndex((monster) => monster.name == "LycanthropeNuit");
    let lycanthropeJourIndex = monsters.findIndex((monster) => monster.name == "LycanthropeJour");
    if (lycanthropeJourIndex != -1){
        monsters[lycanthropeJourIndex] = getCorrespondante(monsters[lycanthropeJourIndex]);
        $("#monster" + (lycanthropeJourIndex + 1) + " img")[0].src = "/imgs/cartes/LycanthropeNuit.png";
    }
    if (lycanthropeNuitIndex != -1){
        monsters[lycanthropeNuitIndex] = getCorrespondante(monsters[lycanthropeNuitIndex]);
        $("#monster" + (lycanthropeNuitIndex + 1) + " img")[0].src = "/imgs/cartes/LycanthropeJour.png";
    }
    lycanthropeNuitIndex = ennemyMonsters.findIndex((monster) => monster.name == "LycanthropeNuit");
    lycanthropeJourIndex = ennemyMonsters.findIndex((monster) => monster.name == "LycanthropeJour");
    if (lycanthropeJourIndex != -1){
        ennemyMonsters[lycanthropeJourIndex] = getCorrespondante(ennemyMonsters[lycanthropeJourIndex]);
        $("#ennemy_monster" + (lycanthropeJourIndex + 1) + " img")[0].src = "/imgs/cartes/LycanthropeNuit.png";
    }
    if (lycanthropeNuitIndex != -1){
        ennemyMonsters[lycanthropeNuitIndex] = getCorrespondante(ennemyMonsters[lycanthropeNuitIndex]);
        $("#ennemy_monster" + (lycanthropeNuitIndex + 1) + " img")[0].src = "/imgs/cartes/LycanthropeJour.png";
    }
}

function getCorrespondante(carte) {
    return Deck[Deck.findIndex((card) => card.name == carte.correspondante)]
}

function isGlobal(carte) {
    switch (carte.name) {
        case "Regeneration":
        case "MomentDeCalme":
        case "BonConseil":
        case "ReposFinal":
        case "Oubli":
        case "EclipseBlanche":
        case "EclipseNoire":
            return true
            break;
    
        default:
            return false;
            break;
    }
}

function isOnCreatures(name) {
    let onCreatures = [
        "Lucidite",
        "PuissanceRedoutable",
        "Soin"
    ]
    return onCreatures.includes(name);
}

function isOnMe(name) {
    let onMe = [
        "Lucidite"
    ]
    return onMe.includes(name);
}

function isOnEnnemyCreatures(name) {
    let onEnnemyCreatures = [
        "Agression",
        "LancerDeTarte",
        "Peur",
    ]
    return onEnnemyCreatures.includes(name);
}

function isOnEnnemy(name) {
    let onEnnemy = [
        "Agression",
    ]
    return onEnnemy.includes(name);
}

function enableTooltip() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}