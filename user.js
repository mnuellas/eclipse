const { Deck } = require("./cartes");

exports.Player = function() {
    this.point_de_vie = 10;
    this.deck = CreateDeck();
    this.cartes_en_main = [];
    this.monsters = [{}, {}, {}];
    this.defausse = [];

    this.getCartes = function() {
        this.cartes_en_main.push(this.deck.shift());
        this.cartes_en_main.push(this.deck.shift());
        this.cartes_en_main.push(this.deck.shift());
    }
}

// function CreateDeck() {
//     return shuffleArray(Deck());
// }
exports.CreateDeck = function() {
    return shuffleArray(Deck());
}
function CreateDeck() {
    return shuffleArray(Deck());
}

function shuffleArray(array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
      // Pick a remaining element
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      // Swap it with the current element.
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
    }
    for (let i = 0; i < 20; i++) {
        array.splice(array.findIndex((element) => element.name == array[i].correspondante), 1);
    }
    console.log("array", array.length)
    return array;
    //prendre un element dans le tableau
    //le mettre dans le tableau
    //enlever son correspondant
    //recommencer tant
    // final_array = []
    // for (let i = 0; i < 20; i++) {
    //     let randId = Math.floor(Math.random() * array.length);
    //     final_array.push(array[randId]);
    //     array.splice(array.findIndex((element) => element.name == array[randId].correspondante), 1);
    //     array.splice(randId, 1);
    // }
    // return final_array
  }
