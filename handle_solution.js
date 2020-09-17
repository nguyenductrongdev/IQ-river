const CONTROLLER_MOVE = $('#controller__move');
const CONTROLLER_HELP = $('#controller__help');
const CONTROLLER_RESTART = $('#controller__restart');
const SHIP_DECK = $('#gamebar__river--ship--items');
const SHIP = $('#gamebar__river--ship');
const A_BANK = $('#gamebar__abank');
const B_BANK = $('#gamebar__bbank');
const INPUT_SETTER = $('#input-setter');
const MESSAGE_BAR = $('#message-bar');
let maxMonk = 3;
let maxDemon = 3;
let maxCapacity = 2;
let onAISolving = false;

function setStatusBar() {
    document.querySelector('#js-abank-nb-monk').innerHTML = `${A_BANK.children('.monk').length}`;
    document.querySelector('#js-abank-nb-demon').innerHTML = `${A_BANK.children('.demon').length}`;
    document.querySelector('#js-ship-nb-monk').innerHTML = `${SHIP_DECK.children('.monk').length}`;
    document.querySelector('#js-ship-nb-demon').innerHTML = `${SHIP_DECK.children('.demon').length}`;
    document.querySelector('#js-bbank-nb-monk').innerHTML = `${B_BANK.children('.monk').length}`;
    document.querySelector('#js-bbank-nb-demon').innerHTML = `${B_BANK.children('.demon').length}`;
}

$('#abank-icon-monk').click(function () {
    if (SHIP.attr('bank') !== 'a') {
        MESSAGE_BAR.html('Cannot get this action because the ship not at a bank');
        return;
    }
    if (A_BANK.children('.monk').length === 0) {
        MESSAGE_BAR.html('Number of monk at a bank is empty');
        return;
    }
    A_BANK.children('.monk').first().click();
});

$('#abank-icon-demon').click(function () {
    if (SHIP.attr('bank') !== 'a') {
        MESSAGE_BAR.html('Cannot get this action because the ship not at a bank');
        return;
    }
    if (A_BANK.children('.demon').length === 0) {
        MESSAGE_BAR.html('Number of demon at a bank is empty');
        return;
    }
    A_BANK.children('.demon').first().click();
});

$('#ship-icon-monk').click(function () {
    if (SHIP_DECK.children('.monk').length === 0) {
        MESSAGE_BAR.html('Number of monk at the ship is empty');
        return;
    }
    putItemShipToBank('monk');
});

$('#ship-icon-demon').click(function () {
    if (SHIP_DECK.children('.demon').length === 0) {
        MESSAGE_BAR.html('Number of demon at the ship is empty');
    }
    putItemShipToBank('demon');
});

$('#bbank-icon-monk').click(function () {
    if (SHIP.attr('bank') !== 'b') {
        MESSAGE_BAR.html('Cannot get this action because the ship not at b bank');
        return;
    }
    if (B_BANK.children('.monk').length === 0) {
        MESSAGE_BAR.html('Number of monk at b bank is empty');
        return;
    }
    B_BANK.children('.monk').first().click();
});

$('#bbank-icon-demon').click(function () {
    if (SHIP.attr('bank') !== 'b') {
        MESSAGE_BAR.html('Cannot get this action because the ship not at b bank');
        return;
    }
    if (B_BANK.children('.demon').length === 0) {
        MESSAGE_BAR.html('Number of demon at b bank is empty');
        return;
    }
    B_BANK.children('.demon').first().click();
});

SHIP.children('#gamebar__river--ship--body').click(function () {
    moveShip();
});

function putItemBankToShip(itemType) {
    let solveBank;
    switch (SHIP.attr('bank')) {
        case 'a':
            solveBank = A_BANK;
            break;
        case 'b':
            solveBank = B_BANK;
            break;
        default:
            return false;
    }
    if (typeof itemType !== 'string') return false;
    // case the ship fully, can't put more any item
    if (SHIP_DECK.children().length === maxCapacity) return false;
    // case number of type not enough
    if (solveBank.children(`.${itemType}`).length === 0) return false;
    let firstItem = solveBank.children(`.${itemType}`).first();
    firstItem.click();
    return true;
}

function putItemShipToBank(itemType) {
    // put an item from ship to a bank
    if (typeof itemType !== 'string') return false;
    if (SHIP_DECK.children(`.${itemType}`).length === 0) return false;

    let fristItem = SHIP_DECK.children(`.${itemType}`).first();
    fristItem.click();
    return true;
}

function moveShip() {
    // case ship haven't any item, so can't move ship
    if (SHIP_DECK.children().length === 0) {
        MESSAGE_BAR.html('Cannot move the ship because it is empty');
        return false
    };
    let desBank = (SHIP.attr('bank') === 'a') ? 'b' : 'a';
    switch (desBank) {
        case 'a':
            return new Promise((res, rej) => {
                SHIP.animate({
                    left: '0'
                }, 500, 'linear', () => {
                    SHIP.attr({ 'bank': 'a' });
                    SHIP_DECK.children().attr('bank', 'a');
                    $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(0deg)', 'transition': 'transform .1s' });
                    res(true);
                });
            });

        case 'b':
            return new Promise((res, rej) => {
                SHIP.animate({
                    left: `${SHIP.parent().width() - SHIP.width()}px`
                }, 500, 'linear', () => {
                    SHIP.attr({ 'bank': 'b' });
                    SHIP_DECK.children().attr('bank', 'b');
                    $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(180deg)', 'transition': 'transform .1s' });
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
    while (SHIP_DECK.children('.monk').length > monk) { await Tool.delay(100); putItemShipToBank('monk') };
    while (SHIP_DECK.children('.demon').length > demon) { await Tool.delay(100); putItemShipToBank('demon') };
    while (SHIP_DECK.children('.monk').length < monk) { await Tool.delay(100); putItemBankToShip('monk') };
    while (SHIP_DECK.children('.demon').length < demon) { await Tool.delay(100); putItemBankToShip('demon'); }
    await moveShip();
    return true;
}

function createNewGame() {
    renderInput(maxMonk, maxDemon);
}

function renderInput(nbMonk = 0, nbDemon = 0) {
    if (nbMonk >= nbDemon) {
        A_BANK.empty();
        B_BANK.empty();
        SHIP_DECK.empty();
        SHIP.animate({ left: '0' }, 'fast', 'linear', () => {
            SHIP.attr('bank', 'a');
            $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(0deg)', 'transition': 'all .2s' });
        });

        $('#gamebar__river--ship--body').css({ 'transform': 'rotateY(0deg)', 'transition': 'all 0s' });
        for (let i = 1; i <= nbMonk; ++i) {
            A_BANK.append('<img class="gamebar__bank--item monk" bank="a" pos="bank" src="./monk.png" alt="monk">');
        }
        for (let i = 1; i <= nbDemon; ++i) {
            A_BANK.append('<img class="gamebar__bank--item demon" bank="a" pos="bank" src="./demon.png" alt="demon">');
        }
        setStatusBar();
        MESSAGE_BAR.html('Let game!! Good luck!!!');
        return true;
    } else {
        return false;
    }
}

function stateIsValid() {
    let shipPos = SHIP.attr('bank');
    let nbDeckMonk = 0, nbDeckDemon = 0;
    let aIsValid = true;
    let bIsValid = true;

    if (SHIP_DECK.children().length > 0) {
        nbDeckMonk = Array.from(SHIP_DECK.children('.monk')).length;
        nbDeckDemon = Array.from(SHIP_DECK.children('.demon')).length;
    }

    let nbAMonk = Array.from(A_BANK.children('.monk')).length;
    let nbADemon = Array.from(A_BANK.children('.demon')).length;
    let nbBMonk = Array.from(B_BANK.children('.monk')).length;
    let nbBDemon = Array.from(B_BANK.children('.demon')).length;
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
    if (SHIP.attr('bank') === 'b') {
        let shipPos = SHIP.attr('bank');
        let nbDeckMonk = 0;
        let nbDeckDemon = 0;

        let nbBMonk = B_BANK.children('.monk').length;
        let nbBDemon = B_BANK.children('.demon').length;

        if (SHIP_DECK.children().length > 0) {
            nbDeckMonk = SHIP_DECK.children('.monk').length;
            nbDeckDemon = SHIP_DECK.children('.demon').length;
        }
        return (nbBMonk + nbDeckMonk === maxMonk) &&
            (nbBDemon + nbDeckDemon === maxDemon) &&
            (shipPos === 'b');
    } else {
        return false;
    }
}

$(document).ready(function () {

    setActionAllItem();

    setStatusBar();

    MESSAGE_BAR.html('Let game!! Good luck!!!');

    CONTROLLER_RESTART
        .click(function () {
            onAISolving = false;
            createNewGame();
        });

    INPUT_SETTER
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
            if (!renderInput(nbMonk, nbDemon))
                MESSAGE_BAR.html('Number of Monk must greater than number of demon');
            else
                MESSAGE_BAR.html('Let game!! Good luck!!!');
            $('#js-nb-total-monk').html(nbMonk);
            $('#js-nb-total-demon').html(nbDemon);
            $('#js-nb-capacity-ship').html(capacity);
        });

    CONTROLLER_MOVE
        .click(async function () {
            let nbShipDeckItems = SHIP_DECK.children().length;
            if (nbShipDeckItems > 0) {
                switch (SHIP.attr('bank')) {
                    case 'a':
                        await moveShip();
                        SHIP.attr({ 'bank': 'b' });
                        SHIP_DECK.children().attr({ 'bank': 'b' });
                        break;
                    case 'b':
                        await moveShip();
                        SHIP.attr({ 'bank': 'a' });
                        SHIP_DECK.children().attr({ 'bank': 'a' });
                        break;
                }

                setStatusBar();

                if (!stateIsValid()) MESSAGE_BAR.html('You lose!');

                if (isGoal()) MESSAGE_BAR.html('Complete game!');

            } else {
                MESSAGE_BAR.html('Cannot move the ship is empty');
            }
        });

    CONTROLLER_HELP
        .click(async function () {
            onAISolving = true;
            let monk = A_BANK.children('.monk').length + (SHIP.attr('bank') === 'a' ? SHIP_DECK.children('.monk').length : 0);
            let demon = A_BANK.children('.demon').length + (SHIP.attr('bank') === 'a' ? SHIP_DECK.children('.demon').length : 0);
            let posShip = SHIP.attr('bank') === 'a' ? State.A_BANK : State.B_BANK;
            State.setMax(maxMonk, maxDemon, maxCapacity);
            let stt = new State(monk, demon, posShip);
            let operators = AISolving.getSolution(stt);
            if (operators.length === 0) {
                MESSAGE_BAR.html('This input is no solutions');
                return true;
            }
            for (let i = 0; i < operators.length; ++i) {
                if (onAISolving === false) {
                    console.log('break solving!!');
                    break;
                }
                await renderStep(operators[i]);
                console.log('solved one step');
            }
            if (isGoal()) MESSAGE_BAR.html('complete game!!!');
            return true;
        });
});

function setActionAllItem() {
    $(document).on('click', '.gamebar__bank--item', function () {
        let Jthis = $(this);
        let itemPos = Jthis.attr('pos');
        switch (itemPos) {
            case 'bank':
                if (SHIP.attr('bank') !== Jthis.attr('bank')) {
                    MESSAGE_BAR.html('Cannot get this action');
                    break;
                }
                if (SHIP_DECK.children().length === maxCapacity) {
                    MESSAGE_BAR.html('The ship is fully, cannot put more any item');
                    break;
                }
                SHIP_DECK.append(Jthis.attr({ 'pos': 'ship' }));
                break;
            case 'ship':
                Jthis.attr('pos', 'bank');
                SHIP.attr('bank') === 'a' ? A_BANK.append(Jthis) : B_BANK.append(Jthis);
                break;
            default:
                break;
        }
        setStatusBar();
    });
}