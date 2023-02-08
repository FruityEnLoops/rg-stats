import t from "tap";
import { isAprx } from "../test-utils/approx";
import { TestCase } from "../test-utils/test-case";
import { ThrowsToSnapshot } from "../test-utils/throw-snapshot";
import { calculate, inverse, SpecificClearTypes } from "./popn-classforce";

t.test("classForce Tests", (t) => {
	function MakeTestCase(
		score: number,
		clearType: SpecificClearTypes,
		level: number,
		expectedClassPoints: number
	): TestCase {
		return (t) =>
			isAprx(
				t,
				calculate(score, clearType, level),
				expectedClassPoints,
				`A score of ${score} and clearType ${clearType} on a chart with level ${level} should be worth ${expectedClassPoints} classForce.`
			);
	}

	const testCases = [
		MakeTestCase(100_000, "perfect", 50, 150.00),
		MakeTestCase(91_154, "clearCircle", 49, 120.623),
		MakeTestCase(91_154, "easyClear", 49, 96.498),
		MakeTestCase(91_112, "fullComboCircle", 49, 122.348),
		MakeTestCase(91_107, "failedCircle", 49, 60.265),
		MakeTestCase(88_978, "clearCircle", 49, 115.178),
		MakeTestCase(90_454, "failedCircle", 49, 59.618),
		MakeTestCase(88_261, "clearCircle", 48, 111.466),
		MakeTestCase(0, "clearCircle", 48, 0),
		MakeTestCase(99_952, "perfect", 1, 2.969),
		MakeTestCase(99_989, "perfect", 50, 148.533),
		MakeTestCase(99_989, "fullComboCircle", 50, 146.370)
	];

	for (const testCase of testCases) {
		testCase(t);
	}

	t.end();
});

t.test("classForce Validation Tests", (t) => {
	ThrowsToSnapshot(
		t,
		() => calculate(95_000, "clearCircle", -1),
		"Should throw if chart level is negative."
	);
	ThrowsToSnapshot(t, () => calculate(100_001, "clearCircle", 10), "Should throw if score is > 100k.");
	ThrowsToSnapshot(t, () => calculate(-1, "clearCircle", 10), "Should throw if score is negative.");

	ThrowsToSnapshot(
		t,
		() => calculate(72_000, "FOO" as SpecificClearTypes, 10),
		"Should throw if clearType is invalid."
	);

	t.end();
});

t.test("Inverse classForce Tests", (t) => {
	function MakeTestCase(
		expectedScore: number,
		clearType: SpecificClearTypes,
		level: number,
		classForce: number
	): TestCase {
		return (t) =>
			isAprx(
				t,
				inverse(classForce, clearType, level),
				expectedScore,
				`${classForce} classForce and clearType ${clearType} on a chart with level ${level} should invert to ${expectedScore} score.`
			);
	}

	const testCases = [
		MakeTestCase(100_000, "perfect", 50, 150.00),
		MakeTestCase(91_154, "clearCircle", 49, 120.623),
		MakeTestCase(91_154, "easyClear", 49, 96.498),
		MakeTestCase(91_112, "fullComboCircle", 49, 122.348),
		MakeTestCase(91_107, "failedCircle", 49, 60.265),
		MakeTestCase(88_978, "clearCircle", 49, 115.178),
		MakeTestCase(90_454, "failedCircle", 49, 59.618),
		MakeTestCase(88_261, "clearCircle", 48, 111.466),
		MakeTestCase(0, "clearCircle", 48, 0),
		MakeTestCase(99_952, "perfect", 1, 2.969),
		MakeTestCase(99_989, "perfect", 50, 148.533),
		MakeTestCase(99_989, "fullComboCircle", 50, 146.370)
	];

	for (const testCase of testCases) {
		testCase(t);
	}

	t.end();
});

t.test("Inverse classForce Validation Tests", (t) => {
	ThrowsToSnapshot(
		t,
		() => inverse(9000, "failedCircle", 1),
		"Should throw if the provided classForce are impossible to achieve given the other constraints."
	);

	ThrowsToSnapshot(t, () => inverse(10, "clearCircle", -1), "Should throw if chart level is negative.");

	t.end();
});
