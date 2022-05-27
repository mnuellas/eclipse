var Carte = function(name, type, color, effect, correspondante, attack, pv, cout) {
    this.name = name;
    this.type = type;
    this.color = color;
    this.effect = effect;
    this.correspondante = correspondante;
    this.attack = attack;
    this.pv = pv;
    this.cout = cout;
}

var Deck = [
    new Carte("EclipseBlanche", "AI", "blanche", "noeffect", "EclipseNoire", 0, 0, 0),
    new Carte("EclipseNoire", "AI", "noire", "noeffect", "EclipseBlanche", 0, 0, 0),
    new Carte("CheminDamne", "AC", "noire", "noEffect", "Regeneration", 0, 0, 0),
    new Carte("Adrenaline", "AC", "noire", "noEffect", "Abondance", 0, 0, 0),
    new Carte("LuneRouge", "AC", "noire", "noEffect", "ReinedelEclipse", 0, 0, 1),
    new Carte("Agression", "AI", "noire", "effect4", "FleurDeVie", 0, 0, 0),
    new Carte("Oubli", "AI", "noire", "effect5", "FideleDefenseur", 0, 0, 0),
    new Carte("Reveil", "AI", "noire", "effect6", "VoyageurAstral", 0, 0, 0),
    new Carte("Peur", "AI", "noire", "effect7", "LancerDeTarte", 0, 0, 1),
    new Carte("PuissanceRedoutable", "AI", "noire", "effect8", "CompagnonAnimal", 0, 0, 1),
    new Carte("ReposFinal", "AI", "noire", "effect9", "AntiqueGolem", 0, 0, 2),
    new Carte("Abondance", "AC", "blanche", "noEffect", "Adrenaline", 0, 0, 0),
    new Carte("Renouveau", "AC", "blanche", "noeffect", "ArbreMaudit", 0, 0, 0),
    new Carte("DoubleSoleil", "AC", "blanche", "doubleSoleil", "RoiDeLEclipse", 0, 0, 1),
    new Carte("Soin", "AI", "blanche", "effect13", "FleurDeMort", 0, 0, 0),
    new Carte("LancerDeTarte", "AI", "blanche", "effect14", "Peur", 0, 0, 0),
    new Carte("BonConseil", "AI", "blanche", "effect15", "Cauchemar", 0, 0, 0),
    new Carte("MomentDeCalme", "AI", "blanche", "effect16", "EspritTrouble", 0, 0, 1),
    new Carte("Regeneration", "AI", "blanche", "effect17", "CheminDamne", 0, 0, 1),
    new Carte("Lucidite", "AI", "blanche", "effect18", "RodeurVigilant", 0, 0, 2),

    new Carte("CoeurDeLaLuneBlanche", "Creature", "blanche", "noeffect", "CoeurDeLaLuneNoire", 5, 5, 3),
    new Carte("CoeurDeLaLuneNoire", "Creature", "noire", "noeffect", "CoeurDeLaLuneBlanche", 5, 5, 3),
    new Carte("FleurDeMort", "Creature", "noire", "carteSup", "Soin", 1, 1, 0),
    new Carte("RodeurVigilant", "Creature", "noire", "noeffect", "Lucidite", 3, 1, 0),
    new Carte("ArbreMaudit", "Creature", "noire", "noeffect", "Renouveau", 2, 3, 0),
    new Carte("Cauchemar", "Creature", "noire", "noeffect", "BonConseil", 4, 2, 1),
    new Carte("ChevalierDuCrepuscule", "Creature", "noire", "carteSup", "Observateur", 3, 2, 1),
    new Carte("LycanthropeNuit", "Creature", "noire", "noeffect", "LycanthropeJour", 4, 1, 1),
    new Carte("EspritTrouble", "Creature", "noire", "defausse2", "MomentDeCalme", 2, 2, 2),
    new Carte("RoiDeLEclipse", "Creature", "noire", "noeffect", "DoubleSoleil", 4, 2, 2),
    new Carte("Faucheuse", "Creature", "noire", "noeffect", "DanseuseDeLAube", 1, 4, 2),
    new Carte("FleurDeVie", "Creature", "blanche", "carteSup", "Agression", 0, 2, 0),
    new Carte("VoyageurAstral", "Creature", "blanche", "noeffect", "Reveil", 2, 2, 0),
    new Carte("Observateur", "Creature", "blanche", "noeffect", "ChevalierDuCrepuscule", 1, 2, 0),
    new Carte("FideleDefenseur", "Creature", "blanche", "noeffect", "Oubli", 1, 3, 1),
    new Carte("CompagnonAnimal", "Creature", "blanche", "cartePioche", "PuissanceRedoutable", 2, 2, 1),
    new Carte("LycanthropeJour", "Creature", "blanche", "noeffect", "LycanthropeNuit", 1, 4, 1),
    new Carte("ReinedelEclipse", "Creature", "blanche", "noeffect", "LuneRouge", 3, 3, 2),
    new Carte("DanseuseDeLAube", "Creature", "blanche", "carteSup2", "Faucheuse", 2, 4, 2),
    new Carte("AntiqueGolem", "Creature", "blanche", "noeffect", "ReposFinal", 3, 5, 2),
]
