class Tool {
    static delay(ms) {
        return new Promise((res, rej) => {
            setTimeout(() => {
                res();
            }, ms);
        });
    }
}

class State {
    static MONK_MAX = 0;
    static DEMON_MAX = 0;
    static CAPACITY_MAX = 0;
    static A_BANK = true;
    static B_BANK = false;
    static EMPTY = 0;

    constructor() {
        switch (arguments.length) {
            case 0:
                this.nbMonk = 0;
                this.nbDemon = 0;
                this.posShip = State.A_BANK;
                break;

            case 1:
                this.nbMonk = arguments[0].nbMonk;
                this.nbDemon = arguments[0].nbDemon;
                this.posShip = arguments[0].posShip;
                break;
            case 2:
                this.nbMonk = arguments[0];
                this.nbDemon = arguments[1];
                this.posShip = State.A_BANK;
                break;
            case 3:
                this.nbMonk = arguments[0];
                this.nbDemon = arguments[1];
                this.posShip = arguments[2];
                break;
        }
    }

    static setMax(monk = 0, demon = 0, capacity = 0) {
        State.MONK_MAX = monk;
        State.DEMON_MAX = demon;
        State.CAPACITY_MAX = capacity;
    }

    setMaxCpacity(capacity) {
        State.CAPACITY_MAX = capacity;
        return this;
    }

    compareState(state) {
        return this.nbMonk === state.nbMonk &&
            this.nbDemon === state.nbDemon &&
            this.posShip === state.posShip;
    }

    isValid() {
        let a_monk = this.nbMonk;
        let a_demon = this.nbDemon;
        let b_monk = State.MONK_MAX - this.nbMonk;
        let b_demon = State.DEMON_MAX - this.nbDemon;

        if (a_monk < 0 || a_demon < 0 || b_monk < 0 || b_demon < 0) return false;
        if (a_monk > State.MONK_MAX || a_demon > State.DEMON_MAX
            || b_monk > State.MONK_MAX || b_demon > State.DEMON_MAX_MAX) return false;
        if (a_monk > 0 && a_monk < a_demon) return false;
        if (b_monk > 0 && b_monk < b_demon) return false;
        return true;
    }

    isGoal() {
        let goal = new State(0, 0, State.B_BANK);
        return this.compareState(goal);
    }

    move(monk = 0, demon = 0) {
        let resultState = {};
        switch (this.posShip) {
            case State.A_BANK:
                resultState = new State(this.nbMonk - monk, this.nbDemon - demon, !this.posShip);
                break;
            case State.B_BANK:
                resultState = new State(this.nbMonk + monk, this.nbDemon + demon, !this.posShip);
                break;
        }
        return [resultState.isValid(), resultState];
    }

    toString() {
        let a_monk = this.nbMonk;
        let a_demon = this.nbDemon;
        let b_monk = State.MONK_MAX - this.nbMonk;
        let b_demon = State.DEMON_MAX - this.nbDemon;

        return `a: {${a_demon}} (${a_monk}) [${this.posShip}] -- b: {${b_demon}} (${b_monk}) [${!this.posShip}]`;
    }
}

class Stack {
    constructor() { this.items = []; }
    isEmpty() { return this.items.length === 0; }
    push(item) { return this.items.push(item); }
    top() { return this.items[this.items.length - 1]; }
    pop() { return this.items.pop(); }
    isIncludeState(state) {
        for (let item of this.items) {
            if (item.getState().compareState(state))
                return true;
        }
        return false;
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

class AISolving {
    static getOperators() {
        let operators = [];
        for (let i = 0; i <= State.CAPACITY_MAX; i++) {
            for (let j = 0; j <= State.CAPACITY_MAX; j++) {
                if (i + j > 0 && i + j <= State.CAPACITY_MAX) {
                    operators.push({ monk: i, demon: j });
                }
            }
        }
        return operators;
    }

    static toStringAllOperator() {
        let operators = AISolving.getOperators();
        return operators.map(operator => {
            let { monk, demon } = operator;
            let str = '';
            if (monk > 0) str += `move ${monk} monk `;
            if (monk > 0 && demon > 0) str += 'and ';
            if (demon > 0) str += `move ${demon} demon`;
            return str;
        });
    }

    static dfsAlgorithm(state) {
        let root = new Node(state, null, -1);
        let open = new Stack();
        let close = new Stack();
        open.push(root);
        while (!open.isEmpty()) {
            let node = open.pop();
            close.push(node);
            if (node.getState().isGoal())
                return node;
            let operators = AISolving.getOperators();
            for (let i = 0; i < operators.length; ++i) {
                let { monk, demon } = operators[i];
                let [isValid, resultState] = node.getState().move(monk, demon);
                if (isValid) {
                    let newState = new State(resultState);
                    if (open.isIncludeState(newState) || close.isIncludeState(newState))
                        continue;
                    let newNode = new Node(newState, node, i);
                    open.push(newNode);
                }
            }
        }
        return null;
    }

    static getSolution(state) {
        if ((State.DEMON_MAX === 0 && State.MONK_MAX === 0) || State.CAPACITY_MAX === 0) return null;
        let solution = AISolving.dfsAlgorithm(state);
        let operators = AISolving.getOperators();
        let result = [];
        if (solution === null) return result;
        while (solution.parentNode !== null) {
            result.unshift(operators[solution.noFunction]);
            solution = solution.parentNode;
        }
        return result;
    }
}
