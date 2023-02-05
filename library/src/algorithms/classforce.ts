import { integer } from "../util/types";

export type SpecificClearTypes = "clearCircle" | "clearDiamond" | "clearStar" | "fullComboCircle" | "fullComboDiamond" | "fullComboStar" | "perfect" | "easyClear" | "failedCircle";
const scoreInfl = 1.5;

const clearTypeCoefficients: Record<SpecificClearTypes, number> = {
    clearCircle: 1,
    clearDiamond: 1,
    clearStar: 1,
    fullComboCircle: 1.015,
    fullComboDiamond: 1.015,
    fullComboStar: 1.015,
    perfect: 1.03,
    easyClear: 0.8,
    failedCircle: 0.5
}

const expectedMaxRating = 150;
const nonInflatedMaxRating = 50 * clearTypeCoefficients["perfect"] * getGradeMultiplier(100000); 
const magicNumber = expectedMaxRating / nonInflatedMaxRating / (Math.pow(100000, scoreInfl) / Math.pow(100000, scoreInfl));
// adjusts the rating for a 100000 on a 50 to expectedMaxRating

/**
 * Calculate the classForce for an individual score.
 *
 * @param score - The score value. Between 0 and 100k.
 * @param specificClearType - The clear type for this score.
 * @param level - The level for this chart. Typically between 1 and 50,
 * but the upper bound is not enforced here.
 */
export function calculate(score: integer, specificClearType: SpecificClearTypes, level: integer) {
    return level * (Math.pow(score, scoreInfl) / Math.pow(10000000, scoreInfl) * clearTypeCoefficients[specificClearType] * getGradeMultiplier(score)) * magicNumber;
}


/**
 * Returns the multiplier for a score (not based on in game grades)
 * @param score The score to get grade multiplier for, between 0 and 100000
 * @returns The grade multiplier for a score
 */
function getGradeMultiplier(score: integer) {
    if(score < 50000) {
        return 0.94;
    } else if(score < 62000) {
        return 0.96;
    } else if(score < 72000) {
        return 0.975;
    } else if(score < 82000) {
        return 0.99;
    } else if(score < 90000) {
        return 1;
    } else if(score < 95000) {
        return 1.01;
    } else if(score < 98000) {
        return 1.02;
    } else if(score < 100000) {
        return 1.03
    } else {
        return 1.04;
    }
}

/**
 * Given a classForce value, expected clear type and chart level, return the
 * score necessary to get that amount of classForce.
 *
 * @param classForce - The classForce to invert.
 * @param specificClearType - The clear type to invert for. The lamp affects how much score is needed
 * to achieve a given classForce value.
 * @param level - The level for the chart. Typically between 1 and 50,
 * but the upper bound is not enforced here.
 */
export function inverse(classForce: number, specificClearType: SpecificClearTypes, level: integer) {
    // return Math.pow(classForce * Math.pow(100000, scoreInfl) / (level * getGradeMultiplier(score) * clearTypeCoefficients[specificClearType] * magicNumber), 1/scoreInfl);
    return 0;
}
