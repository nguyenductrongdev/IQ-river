async function move1DemonAtoB() {
    if (ship.attr('bank') !== 'a') return false;
    if ((shipDeck.children('.demon').length + aBank.children('.demon').length) < 1) return false;
    while (shipDeck.children('.monk').length > 0) putItemShipToBank('monk');
    while (shipDeck.children('.demon').length > 1) putItemShipToBank('demon');
    while (shipDeck.children('.demon').length < 1) putItemBankToShip('demon', 'a');
    await moveShipToBank('b');
}