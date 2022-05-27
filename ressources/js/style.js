$("#monster1")
    .mouseenter(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                $("#monster1").addClass("selectionnable")
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                $("#monster1").addClass("selectionnable")
        }
    })
    .mouseleave(function() {
        $("#monster1").removeClass("selectionnable")
    })
    .click(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                PoseCreature(0)
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                PoseAi(0)
        }
        if (isAttacking) {
            setAttackingWith(0)
        }
    });
$("#monster2")
    .mouseenter(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                $("#monster2").addClass("selectionnable")
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                $("#monster2").addClass("selectionnable")
        }
    })
    .mouseleave(function() {
        $("#monster2").removeClass("selectionnable")
    })
    .click(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                PoseCreature(1)
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                PoseAi(1)
        }
        if (isAttacking) {
            setAttackingWith(1)
        }
    });
$("#monster3")
    .mouseenter(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                $("#monster3").addClass("selectionnable")
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                $("#monster3").addClass("selectionnable")
        }
    })
    .mouseleave(function() {
        $("#monster3").removeClass("selectionnable")
    })
    .click(function() {
        if (selectedCard.type == "Creature") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                PoseCreature(2)
            }
        }
        if (selectedCard.type == "AI" && isOnCreatures(selectedCard.name)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
            PoseAi(2)
        }
        if (isAttacking) {
            setAttackingWith(2)
        }
    });
let clickLucid = 0;
let clickSoin = 0;
$("#card_div")
    .mouseenter(function() {
        if (selectedCard.type == "AI") {
            if (isOnMe(selectedCard.name)){
                if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7))
                    $("#card_div").addClass("selectionnable_div");
            }
        }
    })
    .mouseleave(function() {
        $("#card_div").removeClass("selectionnable_div");
    })
    .click(function() {
        if (selectedCard.type == "AI") {
            if (isOnMe(selectedCard.name)){
               if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || (selectedCard.color == "blanche" && player.cartes_ennemies.length + selectedCard.cout <= 7)) {
                   if (selectedCard.name == "Lucidite" && clickLucid == 0) {
                       clickLucid++;
                   } else if (selectedCard.name == "Soin" && clickSoin == 0) {
                       clickSoin++;
                   } else {
                       clickLucid = 0;
                       clickSoin = 0;
                       PoseAi(3);
                   }
               }
            }
        }
    });

$("#action1")
    .mouseenter(function() {
        if (selectedCard.type == "AC") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                $("#action1").addClass('selectionnable')
            }
        }
        if (selectedCard.name == "Reveil") {
            $("#action1").addClass('selectionnable')
        }
    })
    .mouseleave(function() {
        $("#action1").removeClass('selectionnable')
    })
    .click(function() {
        if (selectedCard.type == "AC") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                PoseActionContinue(0)
            }
        }
        if(selectedCard.name == "Reveil") {
            PoseAi(0);
        }
    });
$("#action2")
    .mouseenter(function() {
        if (selectedCard.type == "AC") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                $("#action2").addClass('selectionnable')
            }
        }
        if (selectedCard.name == "Reveil") {
            $("#action2").addClass('selectionnable')
        }
    })
    .mouseleave(function() {
        $("#action2").removeClass('selectionnable')
    })
    .click(function() {
        if (selectedCard.type == "AC") {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                PoseActionContinue(1)
            }
        }
        if (selectedCard.name == "Reveil") {
            PoseAi(1);
        }
    })

$("#board")
    .mouseenter(function() {
        if (selectedCard.type == "AI" && isGlobal(selectedCard)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                $("#board").css('border', "3px solid black")
            }
        }
    })
    .mouseleave(function() {
        $("#board").css("border", "") 
    })
    .click(function() {
        if (selectedCard.type == "AI" && isGlobal(selectedCard)) {
            if ((selectedCard.color == "noire" && carteSacrifiées.length == selectedCard.cout) || selectedCard.color == "blanche") {
                PoseAi(0);
            }
        }
    })

$("#ennemy_monster1")
    .mouseenter(function() {
        if (jQuery.isEmptyObject(ennemyMonsters[0]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                $("#ennemy_monster1").addClass("selectionnable");
            }
        }
    })
    .mouseleave(function() {
        $("#ennemy_monster1").removeClass("selectionnable");
    })
    .click(function() {
        if (isAttacking && jQuery.isEmptyObject(attackingWith) == false) { //Si on attaque et qu'on a selectionné un monstre
            if(attackingWith.index != 2) {
                if (jQuery.isEmptyObject(ennemyMonsters[0]) == false) {
                    Attack(0);
                }
            }
        }
        if (jQuery.isEmptyObject(ennemyMonsters[0]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                PoseAi(0);
            }
        }
    });
$("#ennemy_monster2")
    .mouseenter(function() {
        if (jQuery.isEmptyObject(ennemyMonsters[1]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                $("#ennemy_monster2").addClass("selectionnable");
            }
        }
    })
    .mouseleave(function() {
        $("#ennemy_monster2").removeClass("selectionnable");
    })
    .click(function() {
        if (isAttacking && jQuery.isEmptyObject(attackingWith) == false) { //Si on attaque et qu'on a selectionné un monstre
            if (jQuery.isEmptyObject(ennemyMonsters[1]) == false) {
                Attack(1);
            }   
        }
        if (jQuery.isEmptyObject(ennemyMonsters[1]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                PoseAi(1);
            }
        }
    });
$("#ennemy_monster3")
    .mouseenter(function() {
        if (jQuery.isEmptyObject(ennemyMonsters[2]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                $("#ennemy_monster3").addClass("selectionnable");
            }
        }
    })
    .mouseleave(function() {
        $("#ennemy_monster3").removeClass("selectionnable");
    })
    .click(function() {
        if (isAttacking && jQuery.isEmptyObject(attackingWith) == false) { //Si on attaque et qu'on a selectionné un monstre
            if(attackingWith.index != 0) {
                if (jQuery.isEmptyObject(ennemyMonsters[2]) == false) {
                    Attack(2);
                }
            }
        }
        if (jQuery.isEmptyObject(ennemyMonsters[2]) == false && selectedCard.type == "AI" ) {
            if(isOnEnnemyCreatures(selectedCard.name)) {
                PoseAi(2);
            }
        }
    });
$("#ennemy_div")
    .mouseenter(function() {
        if (selectedCard.type == "AI" ) {
            if(isOnEnnemy(selectedCard.name)) {
                $("#ennemy_div").addClass("selectionnable_div");
            }
        }
    })
    .mouseleave(function() {
        $("#ennemy_div").removeClass("selectionnable_div");
    })
    .click(function() {
        if (isAttacking && jQuery.isEmptyObject(attackingWith) == false) { //Si on attaque et qu'on a selectionné un monstre
            if (jQuery.isEmptyObject(ennemyMonsters[attackingWith.index]) == true) {
                Attack(3);
            }
        }
        if (selectedCard.type == "AI" ) {
            if(isOnEnnemy(selectedCard.name)) {
                PoseAi(3);
            }
        }
    })