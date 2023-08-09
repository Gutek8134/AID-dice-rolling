"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stat = void 0;
var proxy_state_1 = require("../Tests/proxy_state");
var Utils_1 = require("./Utils");
var constants_1 = require("../Input Modifier/constants");
var Stat = /** @class */ (function () {
    function Stat(name, level) {
        if (!(0, Utils_1.isInStats)(name)) {
            proxy_state_1.state.stats.push(name);
        }
        this.level = level !== null && level !== void 0 ? level : proxy_state_1.state.startingLevel;
        if (constants_1.levellingToOblivion) {
            this.experience = 0;
            this.expToNextLvl = (0, Utils_1.experienceCalculation)(this.level);
        }
        this.type = "stat";
    }
    Stat.prototype.toString = function () {
        return constants_1.levellingToOblivion || !(this.expToNextLvl && this.experience)
            ? String(this.level)
            : "level = ".concat(this.level, " exp = ").concat(this.experience, " exp to lvl up=").concat(this.expToNextLvl, "(").concat(this.expToNextLvl - this.experience, ")");
    };
    return Stat;
}());
exports.Stat = Stat;
