const InitialCosts = [
    5,
    100,
    2500,
    50000,
    1000000,
    25000000,
    500000000,
    10000000000,
    250000000000,
    5000000000000
];

const Multipliers = [
    1, 10, 25, 100, 1000
];

const MultiplierBinding = {
    1: 1,
    10: 2,
    25: 3,
    100: 4,
    1000: 5
};

const PriceTable = (function (max, costs, multipliers) {
    var table = [];
    for (var i = 0; i < costs.length; i++) {
        table[i] = [];
        for (var j = 0; j < multipliers.length; j++) {
            table[i][j] = [];
        }
        table[i][0][0] = costs[i];
        for (var j = 1; j < max; j++) {
            table[i][0][j] = Math.ceil(1.03 * table[i][0][j - 1]);
        }
        for (var j = 1; j < multipliers.length; j++) {
            for (var k = 0; k < (max - multipliers[j]); k++) {
                var cost = 0;
                for (var l = 0; l < multipliers[j]; l++) {
                    cost += table[i][0][k + l];
                }
                table[i][j][k] = cost;
            }
        }
    }
    return table;
})(10001, InitialCosts, Multipliers);

function getRunesFromMoney (money) {
    return Math.trunc((Math.PI * 11592991 / 10748438389408) * Math.pow(money, 0.83));
}

function getRunesFromMoney2 (money) {
    return Math.trunc(0.0000022387211385683589 * Math.pow(money, 0.85));
}

class Building {
    constructor (id, initialDuration, initialIncrement, initialCost, initialLevel) {
        this.id = id;
        this.initialDuration = initialDuration;
        this.initialIncrement = initialIncrement;
        this.initialCost = initialCost;
        this.initialLevel = initialLevel;
    }

    getBaseLevel () {
        return this.initialLevel;
    }

    getUpgradePrice (level, bulk) {
        var amount = MultiplierBinding[bulk];
        if (amount) {
            return PriceTable[this.id][amount - 1][level];
        } else {
            var price = 0;
            for (var i = 0; i < Multipliers.length; i++) {
                while (bulk >= Multipliers[i]) {
                    price += PriceTable[this.id][i][level];
                    level += Multipliers[i];
                    bulk -= Multipliers[i];
                }
            }
            return price;
        }
    }

    getCycleDuration (level) {
        return this.initialDuration * Math.pow(0.8, Building.getNearestBreakpoint(level));
    }

    getCycleProduction (level) {
        return Math.round(this.initialIncrement * level * Math.pow(2, Building.getNearestBreakpoint(level)));
    }

    getCycleIncrement (level) {
        return this.initialIncrement * Math.pow(2, Building.getNearestBreakpoint(level));
    }

    getAmortisation (level, bulk) {
        return this.getUpgradePrice(level, bulk) / (this.getProductionRate(level + bulk) - this.getProductionRate(level));
    }

    getBreakpointAmortisation (level) {
        var nb = Building.getBreakpointLevel(Building.getNearestBreakpoint(level) + 1);
        return this.getUpgradePrice(level, nb - level) / ((this.getCycleProduction(nb) - this.getCycleProduction(level)) / this.getCycleDuration(nb));
    }

    getProductionRate (level) {
        return this.getCycleProduction(level) / this.getCycleDuration(level);
    }

    getProduction (level, duration) {
        return this.getCycleProduction(level) * Math.floor(duration / this.getCycleDuration(level));
    }

    matchProductionRate (level, matched) {
        return this.matchProductionRateBetween(matched, this.getProductionRate(Math.max(1, level)), 0, 10000);
    }

    matchProductionRateBetween (building, minimalRate, min, max) {
        if (max - min <= 2) {
            if (building.getProductionRate(min) >= minimalRate) {
                return min;
            } else if (building.getProductionRate(min + 1) < minimalRate) {
                return max;
            } else {
                return min + 1;
            }
        } else {
            let mid = Math.ceil((max + min) / 2);
            if (building.getProductionRate(mid) > minimalRate) {
                return this.matchProductionRateBetween(building, minimalRate, min, mid);
            } else {
                return this.matchProductionRateBetween(building, minimalRate, mid, max);
            }
        }
    }

    static getNearestBreakpoint (level) {
        if (level < 25) {
            return 0;
        } else if (level < 50) {
            return 1;
        } else if (level < 100) {
            return 2;
        } else if (level < 250) {
            return 3;
        } else if (level < 500) {
            return 4;
        } else if (level < 1000) {
            return 5;
        } else if (level < 2500) {
            return 6;
        } else if (level < 5000) {
            return 7;
        } else {
            return 8;
        }
    }

    static getBreakpointLevel (breakpoint) {
        if (breakpoint > 3) {
            return 10 * Building.getBreakpointLevel(breakpoint - 3);
        } else if (breakpoint == 3) {
            return 100;
        } else if (breakpoint == 2) {
            return 50;
        } else if (breakpoint == 1) {
            return 25;
        } else {
            return 0;
        }
    }
}

Building.Seat = new Building(0, 72, 1, 5, 1);
Building.PopcornStand = new Building(1, 360, 10, 100, 0);
Building.ParkingLot = new Building(2, 720, 40, 2500, 0);
Building.Trap = new Building(3, 1080, 120, 50000, 0);
Building.Drinks = new Building(4, 1440, 320, 1000000, 0);
Building.DeadlyTrap = new Building(5, 2160, 960, 25000000, 0);
Building.VIPSeat = new Building(6, 2880, 2560, 500000000, 0);
Building.Snacks = new Building(7, 4320, 7680, 10000000000, 0);
Building.StrayingMonsters = new Building(8, 8640, 30720, 250000000000, 0);
Building.Toilet = new Building(9, 21600, 153600, 5000000000000, 0);

const NumberLabels = [
    [1E123, 'Quadrag'],
    [1E120, 'Noventrig'],
    [1E117, 'Octotrig'],
    [1E114, 'Septentrig'],
    [1E111, 'Sestrig'],
    [1E108, 'Quinquatrig'],
    [1E105, 'Quattuortrig'],
    [1E102, 'Trestrig'],
    [1E99, 'Duotrig'],
    [1E96, 'Untrig'],
    [1E93, 'Trig'],
    [1E90, 'Novemvig'],
    [1E87, 'Octovig'],
    [1E84, 'Septemvig'],
    [1E81, 'Sesvig'],
    [1E78, 'Quinquavig'],
    [1E75, 'Quattuorvig'],
    [1E72, 'Tresvig'],
    [1E69, 'Duovig'],
    [1E66, 'Unvig'],
    [1E63, 'Vig'],
    [1E60, 'Novendec'],
    [1E57, 'Octodec'],
    [1E54, 'Septendec'],
    [1E51, 'Sedec'],
    [1E48, 'Quinquadec'],
    [1E45, 'Quattuordec'],
    [1E42, 'Tredec'],
    [1E39, 'Duodec'],
    [1E36, 'Undec'],
    [1E33, 'Dec'],
    [1E30, 'Non'],
    [1E27, 'Oct'],
    [1E24, 'Sept'],
    [1E21, 'Sex'],
    [1E18, 'Quint'],
    [1E15, 'Quad'],
    [1E12, 'T'],
    [1E9, 'B'],
    [1E6, 'M']
];

Math.format = function (n) {
    if (n < NumberLabels[NumberLabels.length - 1][0]) {
        return n.toString().split('').map((char, i, array) => ((array.length - 1 - i) % 3 == 2) && i != 0 ? (' ' + char) : char).join('');
    } else if (n > NumberLabels[0][0]) {
        return n.toExponential(3);
    } else {
        for (let i = 0, unit; unit = NumberLabels[i]; i++) {
            if (n >= unit[0]) {
                var num = n / unit[0];
                return (num.toString().includes('.') && num.toString().split('.')[1].length > 3 ? num.toFixed(3) : num).toString().split('e')[0] + ' ' + unit[1];
            }
        }
    }
}

function getFormattedDuration (seconds) {
    let s = (seconds % 60);
    let m = ((seconds - seconds % 60) / 60) % 60;
    let h = ((seconds - seconds % 3600) / 3600) % 24;
    let d = (seconds - seconds % 86400) / 86400;
    if (d) {
        return `${d}D ${h}H ${m}M ${s}S`;
    } else if (h) {
        return `${h}H ${m}M ${s}S`;
    } else if (m) {
        return `${m}M ${s}S`;
    } else {
        return `${s}S`;
    }
}
