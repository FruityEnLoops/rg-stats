import { integer } from "../util/types";
import { GetEntriesAsArray } from "../util/misc";
import { ThrowIf } from "../util/throw-if";
import { FloorToNDP } from "../util/math";

export type SpecificClearTypes = "clearCircle" | "clearDiamond" | "clearStar" | "fullComboCircle" | "fullComboDiamond" | "fullComboStar" | "perfect" | "easyClear" | "failedCircle";
export type popnGrades = "P" | "S" | "AAA" | "AA" | "A" | "B" | "C" | "D" | "E";
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

const gradeCoefficients: Record<popnGrades, number> = {
    P: 1.04,
    S: 1.03,
    AAA: 1.02,
    AA: 1.01,
    A: 1,
    B: 0.99,
    C: 0.975,
    D: 0.96,
    E: 0.94
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
 * 
 * @returns A number between 0 and 150, unless the level specified is above 50.
 */
export function calculate(score: integer, specificClearType: SpecificClearTypes, level: integer) {
	ThrowIf.negative(score, "Score cannot be negative.", { score });
	ThrowIf(score > 100_000, "Score cannot be better than 100k.", { score });
	ThrowIf.negative(level, "Chart level cannot be negative.", { level });
	ThrowIf(clearTypeCoefficients[specificClearType] == undefined, "Unknown lamp passed to pop'n Class Points calculations. ", { specificClearType });

    const unroundedClassForce = level * (Math.pow(score, scoreInfl) / Math.pow(100000, scoreInfl) * clearTypeCoefficients[specificClearType] * getGradeMultiplier(score)) * magicNumber;
	return FloorToNDP(unroundedClassForce, 3);
}


/**
 * Returns the multiplier for a score (not based on in game grades)
 * @param score The score to get grade multiplier for, between 0 and 100000
 * @returns The grade multiplier for a score
 */
function getGradeMultiplier(score: integer) {
    if(score < 50000) { // E
        return 0.94;
    } else if(score < 62000) { // D
        return 0.96;
    } else if(score < 72000) { // C
        return 0.975;
    } else if(score < 82000) { // B
        return 0.99;
    } else if(score < 90000) { // A
        return 1;
    } else if(score < 95000) { // AA
        return 1.01;
    } else if(score < 98000) { // AAA
        return 1.02;
    } else if(score < 100000) { // S
        return 1.03
    } else {
        return 1.04;
    }
}

/**
 * Given a pop'n grade, return the lower and upper bounds for scoring in this grade.
 * This is used to invert the gradeCoefficient function in classForce.
 *
 * Bounds are returned as lower <= k < upper.
 */
function popnGetGradeBoundaries(grade: popnGrades): { lower: integer; upper: integer } {
	if (grade === "P") {
		return { lower: 100000, upper: 100000 };
	} else if (grade === "S") {
		return { lower: 98000, upper: 100000 };
	} else if (grade === "AAA") {
		return { lower: 95000, upper: 98000 };
	} else if (grade === "AA") {
		return { lower: 90000, upper: 95000 };
	} else if (grade === "A") {
		return { lower: 82000, upper: 90000 };
	} else if (grade === "B") {
		return { lower: 72000, upper: 82000 };
	} else if (grade === "C") {
		return { lower: 62000, upper: 72000 };
    } else if (grade === "D") {
        return { lower: 50000, upper: 62000 };
    }
    return { lower: 0, upper: 50000 };
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
 * 
 * @returns A number between 0 and 100,000.
 */
export function inverse(classForce: number, specificClearType: SpecificClearTypes, level: integer) {
    ThrowIf.negative(level, "Chart level cannot be negative.", { level });

    const scoreTimesGradeCoef = classForce * Math.pow(100000, scoreInfl) / (level * clearTypeCoefficients[specificClearType] * magicNumber);
	const score = AttemptGradeCoefficientDivide(scoreTimesGradeCoef, gradeCoefficients);

	ThrowIf(score === -1, `A classForce of ${classForce} is not possible on a chart with level ${level}.`, {
		classForce,
		level,
	});

	return score;
}


/**
 * Go through all of the gradeBoundaries for a game and use them as guesses for score
 * values.
 *
 * This means we try dividing by all the gradeCoefficients until we find one
 * where the resulting score would have the same grade as the given coefficient.
 *
 * Used for inverting ClassForce.
 *
 * @param scoreTimesGradeCoef - The expected score multiplied by the gradeCoefficient.
 * @param coefficients - A record of popnGrades -> gradeCoefficient
 * @returns The score divided by the gradeCoefficient. If not possible, this returns -1.
 */
function AttemptGradeCoefficientDivide(
	scoreTimesGradeCoef: number,
	coefficients: Record<popnGrades, number>
) {
	for (const [grade, gradeCoef] of GetEntriesAsArray(coefficients).reverse()) {
		const maybeScore = Math.pow(scoreTimesGradeCoef / gradeCoef, 1 / scoreInfl);
		const { lower, upper } = popnGetGradeBoundaries(grade);

		if (maybeScore <= lower) {
			return lower;
		} else if (maybeScore < upper || (maybeScore === upper && upper === 100_000)) {
			return Math.round(maybeScore);
		}
	}

	return -1;
}
