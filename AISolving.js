const A_BANK = true;
const B_BANK = false;
const MAX_NO_MONK = 3;
const MAX_NO_DEMON = 3;
const EMPTY = 0;

class Stack {
    constructor() { this.items = []; }
    isEmpty() { return this.items.length === 0; }
    push(item) { return this.items.push(item); }
    top() { return this.items[this.items.length - 1]; }
    pop() { return this.items.pop(); }
    find_state_in_stack(state) {
        for (let item of this.items) {
            if (item.getState().compareState(state))
                return true;
        }
        return false;
    }
}

class State {
    constructor() {
        switch (arguments.length) {
            case 0:
                this.nbMonk = 0;
                this.nbDemon = 0;
                this.posShip = A_BANK;
                break;

            case 1:
                this.nbMonk = arguments[0].nbMonk;
                this.nbDemon = arguments[0].nbDemon;
                this.posShip = arguments[0].posShip;
                break;
            case 3:
                this.nbMonk = arguments[0];
                this.nbDemon = arguments[1];
                this.posShip = arguments[2];
                break;
        }
    }

    compareState(state) {
        return this.nbMonk === state.nbMonk &&
            this.nbDemon === state.nbDemon &&
            this.posShip === state.posShip;
    }

    toString() {
        let a_monk = this.nbMonk;
        let a_demon = this.nbDemon;
        let b_monk = MAX_NO_MONK - this.nbMonk;
        let b_demon = MAX_NO_DEMON - this.nbDemon;

        return `a: {${a_demon}} (${a_monk}) [${this.posShip}] -- b: {${b_demon}} (${b_monk}) [${!this.posShip}]`;
    }
}

class Node {
    constructor() {
        switch (arguments.length) {
            case 1:
                this.state = new State(arguments[0].state);
                this.parentNode = arguments[0].parentNode;
                this.noFunction = arguments[0].noFunction;
                break;
            case 3:
                this.state = new State(arguments[0]);
                this.parentNode = arguments[1];
                this.noFunction = arguments[2];
                break;
        }
    }

    getState() {
        return new State(this.state);
    }
}

function makeNullState(st) {
    st = new State(0, 0, A_BANK);
}

function checkGoal(stt) {
    let goal = new State(0, 0, B_BANK);
    return stt.compareState(goal);
}

function isValid(side_bank) {
    let a_monk = side_bank.nbMonk;
    let a_demon = side_bank.nbDemon;
    let b_monk = MAX_NO_MONK - side_bank.nbMonk;
    let b_demon = MAX_NO_DEMON - side_bank.nbDemon;

    return ((a_monk >= a_demon || a_monk === EMPTY) && (a_monk >= 0 && a_demon >= 0)) &&
        ((b_monk >= b_demon || b_monk === EMPTY) && (b_monk >= 0 && b_demon >= 0));
}

function move1MonkToB(currState) {
    let resultState = new State(currState.nbMonk - 1, currState.nbDemon, B_BANK);
    return [(isValid(resultState) && currState.posShip === A_BANK), resultState];
}

function move2MonkToB(currState) {
    let resultState = new State(currState.nbMonk - 2, currState.nbDemon, B_BANK);
    return [(isValid(resultState) && currState.posShip === A_BANK), resultState];
}

function move1MonkAnd1DemonToB(currState) {
    let resultState = new State(currState.nbMonk - 1, currState.nbDemon - 1, B_BANK);
    return [(isValid(resultState) && currState.posShip === A_BANK), resultState];
}

function move1DemonToB(currState) {
    let resultState = new State(currState.nbMonk, currState.nbDemon - 1, B_BANK);
    // console.log('move1DemonToB', resultState);

    return [(isValid(resultState) && currState.posShip === A_BANK), resultState];
}

function move2DemonToB(currState) {
    let resultState = new State(currState.nbMonk, currState.nbDemon - 2, B_BANK);
    return [(isValid(resultState) && currState.posShip === A_BANK), resultState];
}

// to A
function move1MonkToA(currState) {
    let resultState = new State(currState.nbMonk + 1, currState.nbDemon, A_BANK);
    return [(isValid(resultState) && currState.posShip === B_BANK), resultState];
}

function move2MonkToA(currState) {
    let resultState = new State(currState.nbMonk + 2, currState.nbDemon, A_BANK);
    return [(isValid(resultState) && currState.posShip === B_BANK), resultState];
}

function move1MonkAnd1DemonToA(currState) {
    let resultState = new State(currState.nbMonk + 1, currState.nbDemon + 1, A_BANK);
    return [(isValid(resultState) && currState.posShip === B_BANK), resultState];
}

function move1DemonToA(currState) {
    let resultState = new State(currState.nbMonk, currState.nbDemon + 1, A_BANK);
    return [(isValid(resultState) && currState.posShip === B_BANK), resultState];
}

function move2DemonToA(currState) {
    let resultState = new State(currState.nbMonk, currState.nbDemon + 2, A_BANK);
    return [(isValid(resultState) && currState.posShip === B_BANK), resultState];
}

function printStack(stack) {
    while (!stk.isEmpty()) {
        printState(stk.top().state);
        stk.pop();
    }
}

const action = [
    "Start state",
    "move 1 demon", "move 2 demon", "move 1 demon and 1 monk",
    "move 1 monk", "move 2 monk"
];

function calls_operators(opt, currState) {
    switch (opt) {
        // Di chuyen 1 Quy
        case 1: {
            switch (currState.posShip) {
                case A_BANK: return move1DemonToB(currState);
                case B_BANK: return move1DemonToA(currState);
            }
        }
        // Di chuyen 2 Quy
        case 2: {
            switch (currState.posShip) {
                case A_BANK: return move2DemonToB(currState);
                case B_BANK: return move2DemonToA(currState);
            }
        }
        // Di chuyen 1 Quy va 1 Thay
        case 3: {
            switch (currState.posShip) {
                case A_BANK: return move1MonkAnd1DemonToB(currState);
                case B_BANK: return move1MonkAnd1DemonToA(currState);
            }
        }
        // Di chuyen 1 Thay
        case 4: {
            switch (currState.posShip) {
                case A_BANK: return move1MonkToB(currState);
                case B_BANK: return move1MonkToA(currState);
            }
        }
        // Di chuyen 2 Thay
        case 5: {
            switch (currState.posShip) {
                case A_BANK: return move2MonkToB(currState);
                case B_BANK: return move2MonkToA(currState);
            }
        }
        default:
            return [false, currState];
    }
}

function dfsAlgorithm(state) {
    let root = new Node(state, null, 0);
    let open = new Stack();
    let close = new Stack();

    open.push(root);

    while (!open.isEmpty()) {
        let node = open.pop();
        close.push(node);
        // console.log('push close', close.top().getState().toString());

        if (checkGoal(node.getState()))
            return node;

        for (let i = 1; i <= 5; ++i) {
            let callResult = calls_operators(i, node.getState());
            if (callResult[0]) {
                let new_state = new State(callResult[1]);
                if (open.find_state_in_stack(new_state) || close.find_state_in_stack(new_state))
                    continue;
                let new_node = new Node(new_state, node, i);
                open.push(new_node);
            }
        }
    }
    return null;
}

function printWaysToGetGoal(root) {
    let storage = new Stack();
    // console.log(root)
    while (root.parentNode !== null) {
        storage.push(root);
        root = root.parentNode;
    }
    storage.push(root);
    let count = 0;
    while (!storage.isEmpty()) {
        console.log(`** Step ${++count}:`);
        let storageTop = storage.pop();
        console.log(`Action: ${action[storageTop.noFunction]}`);
        console.log(storageTop.getState().toString());
    }
}

function pathOperator(goalNode) {
    let pathResult = [];
    while (goalNode.parentNode !== null) {
        pathResult.unshift(goalNode.noFunction);
        goalNode = goalNode.parentNode;
    }
    return pathResult;
}

function setInput(monk, demon, shipCapacity = 2) {
    let root = new State(monk, demon, A_BANK);
    let solution = dfsAlgorithm(root);
    return solution !== null ? pathOperator(solution) : 'no solution';
}

