# Pop' ClassForce

Pop' ClassForce functionality is exported under `PopnClassForce`. To use it,
```ts
import { PopnClassForce } from "rg-stats"
```

## About

ClassForce is an algorithm made for [pop'n music](https://en.wikipedia.org/wiki/Pop%27n_Music).
It's designed to replace Class Points which doesn't work as a skill measurement.

BPI is defined such the minimal score is worth 0 CF, and the maximum score is worth 150 CF.

!!! note
	This algorithm isn't actually part of the game! It's something that was developed by and is maintained by players.

## `PopnClassForce.calculate()`

Calculates ClassForce a given score and lamp is worth on that chart level.

!!! info
	PopnLamps is defined as follows:

	```ts
	type SpecificClearTypes = "clearCircle" | "clearDiamond" | "clearStar" | "fullComboCircle" | "fullComboDiamond" | "fullComboStar" | "perfect" | "easyClear" | "failedCircle";
	```

### Signature

```ts
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
function calculate(
	score: integer,
	specificClearType: SpecificClearTypes,
	level: integer
): number
```

## `PopnClassForce.inverse()`

Given ClassForce, return the score needed to achieve that on the given chart level.

!!! warning
	Throws if the ClassForce requested is not achievable with the other constraints.

### Signature

```ts
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
function inverse(
	classForce: number,
	specificClearType: SpecificClearTypes,
	level: integer
): number
```
