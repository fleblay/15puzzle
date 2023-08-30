
type Pos2D = {
	X: number,
	Y: number,
}

export function isEqual(a: number[], b: number[]): boolean {
	if (a.length != b.length)
		return false
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i])
			return false
	}
	return true
}

function getEmptySpot(board: number[][]): Pos2D {
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			if (board[i][j] == 0)
				return { Y: i, X: j }
		}
	}
	return { Y: -1, X: -1 }
}

function expandArray(board: number[]): number[][] {
	const expandedArray: number[][] = []
	for (let i = 0; i < 4; i++) {
		expandedArray.push(
			board.slice(4 * i, 4 * (i + 1))
		)
	}
	return expandedArray
}

function flattenArray(board: number[][]): number[] {
	const flattenedArray: number[] = []
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			flattenedArray.push(board[i][j])
		}
	}
	return flattenedArray
}

export function revertSolution(solution: string): string {
	return solution.split("").map((move: string) => {
		switch (move) {
			case "U":
				return "D"
			case "D":
				return "U"
			case "L":
				return "R"
			case "R":
				return "L"
			default:
				return move
		}
	}).join("")
}

export function formatSolution(text: string, divideCount: number): string {
	return text.split("").map((letter, index) => {
		if ((index != 0) && (index != text.length - 1) && (index % divideCount == 0))
			return " | " + letter
		else if (index == 0 && index == text.length - 1)
			return "[" + letter + "]"
		else if (index == 0)
			return "[" + letter
		else if (index == text.length - 1)
			return letter + "]"
		return letter
	}).join("")
}

export function moveUp(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.Y > 0) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y - 1][posEmtpySpot.X]
		expandedArray[posEmtpySpot.Y - 1][posEmtpySpot.X] = 0
	}
	return flattenArray(expandedArray)
}

export function moveDown(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.Y < 4 - 1) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y + 1][posEmtpySpot.X]
		expandedArray[posEmtpySpot.Y + 1][posEmtpySpot.X] = 0
	}
	return flattenArray(expandedArray)
}

export function moveLeft(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.X > 0) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y][posEmtpySpot.X - 1]
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X - 1] = 0
	}
	return flattenArray(expandedArray)
}

export function moveRight(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.X < 4 - 1) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y][posEmtpySpot.X + 1]
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X + 1] = 0
	}
	return flattenArray(expandedArray)
}

