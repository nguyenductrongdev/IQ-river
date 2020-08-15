const controller = $('#controller__move');
const restart = $('#controller__restart');
const shipDeck = $('#gamebar__river--ship--items');
const ship = $('#gamebar__river--ship');
const gamebarBankItems = $('.gamebar__bank--item');
const aBank = $('#gamebar__abank');
const bBank = $('#gamebar__bbank');
const appendInputor = $('#appendInputor');
let maxMonk = 3;
let maxDemon = 3;
let maxCapacity = 2;

function setStatusBar() {
    document.querySelector('#js-abank-monk').innerHTML = `${aBank.children('.monk').length}`;
    document.querySelector('#js-abank-demon').innerHTML = `${aBank.children('.demon').length}`;
    document.querySelector('#js-ship-monk').innerHTML = `${shipDeck.children('.monk').length}`;
    document.querySelector('#js-ship-demon').innerHTML = `${shipDeck.children('.demon').length}`;
    document.querySelector('#js-bbank-monk').innerHTML = `${bBank.children('.monk').length}`;
    document.querySelector('#js-bbank-demon').innerHTML = `${bBank.children('.demon').length}`;
}

function putItemBankToShip(itemType) {
    let solveBank;
    switch (ship.attr('bank')) {
        case 'a':
            solveBank = aBank;
            break;
        case 'b':
            solveBank = bBank;
            break;
        default:
            return false;
    }
    if (typeof itemType !== 'string') return false;
    // case the ship fully, can't put more any item
    if (shipDeck.children().length === maxCapacity) return false;
    // case number of type not enough
    if (solveBank.children(`.${itemType}`).length === 0) return false;
    let firstItem = solveBank.children(`.${itemType}`).first();
    firstItem.click();
    return true;
}

function putItemShipToBank(itemType) {
    // put an item from ship to a bank
    if (typeof itemType !== 'string') return false;
    if (shipDeck.children(`.${itemType}`).length === 0) return false;

    let fristItem = shipDeck.children(`.${itemType}`).first();
    fristItem.click();
    return true;
}

function moveShip() {
    // case ship haven't any item, so can't move ship
    if (shipDeck.children().length === 0) return false;
    let desBank = (ship.attr('bank') === 'a') ? 'b' : 'a';
    switch (desBank) {
        case 'a':
            return new Promise((res, rej) => {
                ship.animate({
                    left: '0'
                }, 500, 'linear', () => {
                    ship.attr({ 'bank': 'a' });
                    shipDeck.children().attr('bank', 'a');
                    $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(0deg)', 'transition': 'all 0.2s' });
                    res(true);
                });
            });

        case 'b':
            return new Promise((res, rej) => {
                ship.animate({
                    left: `${ship.parent().width() - ship.width()}px`
                }, 500, 'linear', () => {
                    ship.attr({ 'bank': 'b' });
                    shipDeck.children().attr('bank', 'b');
                    $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(180deg)', 'transition': 'all 0.2s' });
                    res(true);
                });
            });
        default:
            return false;
    }
}

async function renderStep(operator) {
    // operator format: {monk: number, demon: number};
    let { monk, demon } = operator;
    // case item to move greater than max ship capacity
    if (monk + demon > maxCapacity) return false;
    // console.log(monk, demon);
    while (shipDeck.children('.monk').length > monk) { await Tool.delay(300); putItemShipToBank('monk') };
    while (shipDeck.children('.demon').length > demon) { await Tool.delay(300); putItemShipToBank('demon') };
    while (shipDeck.children('.monk').length < monk) { await Tool.delay(300); putItemBankToShip('monk') };
    while (shipDeck.children('.demon').length < demon) { await Tool.delay(300); putItemBankToShip('demon'); }
    await moveShip();
}

function createNewGame() {
    renderInput(maxMonk, maxDemon);
}

function renderInput(nbMonk = 0, nbDemon = 0) {
    if (nbMonk >= nbDemon) {
        aBank.empty();
        bBank.empty();
        shipDeck.empty();
        ship.animate({ left: '0' }, 'fast', 'linear', () => {
            ship.attr('bank', 'a');
            $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(0deg)', 'transition': 'all 0.2s' });
        });
        for (let i = 1; i <= nbMonk; ++i) {
            aBank.append('<img class="gamebar__bank--item monk" bank="a" pos="bank" src="./monk.png" alt="monk">');
        }
        for (let i = 1; i <= nbDemon; ++i) {
            aBank.append('<img class="gamebar__bank--item demon" bank="a" pos="bank" src="./demon.png" alt="demon">');
        }
        setActionAllItem();
        setStatusBar();
        return true;
    } else {
        return false;
    }
}

function stateIsValid() {
    let shipPos = ship.attr('bank');
    let nbDeckMonk = 0, nbDeckDemon = 0;
    let aIsValid = true;
    let bIsValid = true;

    if (shipDeck.children().length > 0) {
        nbDeckMonk = Array.from(shipDeck.children('.monk')).length;
        nbDeckDemon = Array.from(shipDeck.children('.demon')).length;
    }

    let nbAMonk = Array.from(aBank.children('.monk')).length;
    let nbADemon = Array.from(aBank.children('.demon')).length;
    let nbBMonk = Array.from(bBank.children('.monk')).length;
    let nbBDemon = Array.from(bBank.children('.demon')).length;
    if (shipPos === 'a') {
        let totalAMonk = nbAMonk + nbDeckMonk;
        let totalADemon = nbADemon + nbDeckDemon;
        let totalBMonk = nbBMonk;
        let totalBDemon = nbBDemon;
        if (totalAMonk > 0)
            aIsValid = totalAMonk >= totalADemon;
        if (totalBMonk > 0) {
            bIsValid = totalBMonk >= totalBDemon;
        }

    } else if (shipPos === 'b') {
        let totalAMonk = nbAMonk;
        let totalADemon = nbADemon;
        let totalBMonk = nbBMonk + nbDeckMonk;
        let totalBDemon = nbBDemon + nbDeckDemon;
        if (totalAMonk > 0)
            aIsValid = totalAMonk >= totalADemon;
        if (totalBMonk > 0) {
            bIsValid = totalBMonk >= totalBDemon;
        }
    }
    return aIsValid && bIsValid;
}

function isGoal() {
    if (ship.attr('bank') === 'b') {
        let shipPos = ship.attr('bank');
        let nbDeckMonk = 0;
        let nbDeckDemon = 0;

        let nbBMonk = bBank.children('.monk').length;
        let nbBDemon = bBank.children('.demon').length;

        if (shipDeck.children().length > 0) {
            nbDeckMonk = shipDeck.children('.monk').length;
            nbDeckDemon = shipDeck.children('.demon').length;
        }
        return (nbBMonk + nbDeckMonk === maxMonk) &&
            (nbBDemon + nbDeckDemon === maxDemon) &&
            (shipPos === 'b');
    } else {
        return false;
    }
}

$('document').ready(function () {

    setActionAllItem();

    setStatusBar();

    restart
        .click(createNewGame);

    appendInputor
        .click(function () {
            let nbMonk = parseInt($('#initor__valueMonk').val());
            let nbDemon = parseInt($('#initor__valueDemon').val());
            let capacity = Math.max(1, parseInt($('#initor__valueCapacity').val()));

            maxMonk = nbMonk;
            maxDemon = nbDemon;
            maxCapacity = capacity;

            $('#initor__valueMonk').val('');
            $('#initor__valueDemon').val('');
            $('#initor__valueCapacity').val('');
            if (!renderInput(nbMonk, nbDemon)) alert('Number of Monk must greater than number of demon');
            else setTimeout(() => alert('Let go !!!'), 0.1);
        });

    controller
        .click(async function () {
            let nbShipDeckItems = shipDeck.children().length;
            if (nbShipDeckItems > 0) {
                switch (ship.attr('bank')) {
                    case 'a':
                        await moveShip();
                        ship.attr({ 'bank': 'b' });
                        shipDeck.children().attr({ 'bank': 'b' });
                        break;
                    case 'b':
                        await moveShip();
                        ship.attr({ 'bank': 'a' });
                        shipDeck.children().attr({ 'bank': 'a' });
                        break;
                }

                setStatusBar();

                if (!stateIsValid()) {
                    alert('You lose!');
                    createNewGame();
                }

                if (isGoal()) {
                    alert('Complete game!');
                    createNewGame();
                }

            } else {
                alert("can't get this action");
            }
        });

    $('#controller__help')
        .click(async function () {
            let monk = aBank.children('.monk').length;
            let demon = aBank.children('.demon').length;
            let posShip = ship.attr('bank') === 'a' ? State.A_BANK : State.B_BANK;
            State.setMax(maxMonk, maxDemon, maxCapacity);
            let stt = new State(monk, demon, posShip);
            let operators = AISolving.getSolution(stt);
            if (operators.length === 0) {
                console.log('no solutions');
                return;
            }
            for (let i = 0; i < operators.length; ++i) {
                await renderStep(operators[i]);
            }
            if (isGoal()) alert('complete game!!!');
        });
});

function setActionAllItem(items = Array.from($('.gamebar__bank--item'))) {
    for (let item of items) {
        item.onclick = function () {
            let Jthis = $(this);
            if (ship.attr('bank') === Jthis.attr('bank')) {
                let itemPos = Jthis.attr('pos');
                switch (Jthis.attr('bank')) {
                    case 'a':
                        if (itemPos === 'bank') {
                            if (shipDeck.children().length < maxCapacity) {
                                // aBank.remove(Jthis);
                                Jthis.remove();
                                shipDeck.append(Jthis.attr({ 'pos': 'ship' }));
                            } else {
                                alert("The ship fully, can't put more anyone")
                            }

                        } else if (itemPos === 'ship') {
                            shipDeck.remove(Jthis);
                            if (ship.attr('bank') === 'a') {
                                aBank.append(Jthis.attr({ 'pos': 'bank' }));
                            } else {
                                bBank.append(Jthis.attr({ 'pos': 'bank' }));
                            }
                        }
                        break;
                    case 'b':
                        if (itemPos === 'bank') {
                            if (shipDeck.children().length < maxCapacity) {
                                // bBank.remove(Jthis);
                                Jthis.remove();
                                shipDeck.append(Jthis.attr({ 'pos': 'ship' }));
                            } else {
                                alert("The ship fully, can't put more anyone")
                            }
                        } else if (itemPos === 'ship') {
                            shipDeck.remove(Jthis);
                            if (ship.attr('bank') === 'a') {
                                aBank.append(Jthis.attr({ 'pos': 'bank' }));
                            } else {
                                bBank.append(Jthis.attr({ 'pos': 'bank' }));
                            }
                        }
                        break;
                }
            } else {
                alert("can't get this action");
            }

            setStatusBar();
        }
    }
}