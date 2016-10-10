
/*
 * Joker: 15
 * Jack: 11
 * Queen: 12
 * King: 13
 * Ace = 1
 */ 

function Card(suit, kind){
    this._suit = suit;
    this._kind = kind;
}

Card.prototype.getSuit = function getSuit(){
    return this._suit;
}

Card.prototype.getKind = function getKind(){
    return this._kind;
}

Card.prototype.isCardEqual = function isCardEqual(card){
    return ((card.getSuit() == this._suit) && (card.getKind() == this._kind)); 
}

Card.prototype.isCardStronger = function isCardStronger(card){
    return this._kind > card.getKind();
}
