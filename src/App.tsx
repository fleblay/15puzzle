import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import { SxProps } from "@mui/material/styles";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSwipeable } from "react-swipeable";

const commonStyles: SxProps = {
	border: 2,
	borderRadius: 1,
	margin: 0.5,
	aspectRatio: 1.2,
	fontWeight: 2,
	fontSize: "3em",
	backgroundColor: "lightsteelblue"
}

type Pos2D = {
	X: number,
	Y: number,
}

var swipeConfig = {
	preventScrollOnSwipe: true,
}

var flatWinGrid: number[] = [1, 2, 3, 4, 12, 13, 14, 5, 11, 0, 15, 6, 10, 9, 8, 7]

function isEqual(a: number[], b: number[]): boolean {
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

function moveUp(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.Y > 0) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y - 1][posEmtpySpot.X]
		expandedArray[posEmtpySpot.Y - 1][posEmtpySpot.X] = 0
	}
	return flattenArray(expandedArray)
}

function moveDown(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.Y < 4 - 1) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y + 1][posEmtpySpot.X]
		expandedArray[posEmtpySpot.Y + 1][posEmtpySpot.X] = 0
	}
	return flattenArray(expandedArray)
}

function moveLeft(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.X > 0) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y][posEmtpySpot.X - 1]
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X - 1] = 0
	}
	return flattenArray(expandedArray)
}

function moveRight(board: number[]): number[] {
	const expandedArray: number[][] = expandArray(board)
	const posEmtpySpot: Pos2D = getEmptySpot(expandedArray)
	if (posEmtpySpot.X < 4 - 1) {
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X] = expandedArray[posEmtpySpot.Y][posEmtpySpot.X + 1]
		expandedArray[posEmtpySpot.Y][posEmtpySpot.X + 1] = 0
	}
	return flattenArray(expandedArray)
}

function Row({ index, input }: { index: number, input: number[] }) {
	const cells: React.ReactElement[] = []
	for (let i = 0; i < 4; i++) {
		cells.push(
			<Grid key={`${index}.${i}`} item xs={3} >
				<Box display="flex" justifyContent="center" alignItems="center" sx={{ ...commonStyles }}>
					{input[i] != 0 ? input[i] : ""}
				</Box>
			</Grid>
		)
	}
	return (
		<Grid container>
			{cells}
		</Grid >
	)
}


function Board({ input }: { input: number[] }) {
	const [board, setBoard] = useState<number[]>(input)
	const [text, setText] = useState<string>("")
	const rows: React.ReactElement[] = []
	const handlers = useSwipeable({
		onSwipedUp: () => {
			setBoard(moveUp(board))
			setText("Up")
		},
		onSwipedDown: () => {
			setBoard(moveDown(board))
			setText("Down")
		},
		onSwipedLeft: () => {
			setBoard(moveLeft(board))
			setText("Left")
		},
		onSwipedRight: () => {
			setBoard(moveRight(board))
			setText("Right")
		},
		...swipeConfig
	});

	function fetchBoard() {
		axios
			.get(`http://${location.hostname}:8081/generate/4`)
			.then(({ data }: { data: { size: number, board: string } }) => {
				const newboard: number[] = data.board.trim().split(" ").map(elem => +elem)
				setBoard(newboard)
			})
			.catch(e => {
				console.log("fetch error : ", e)
				setText("Something went wrong fetching a random board. Hit the button again !")
			})
	}

	function solve() {
		if (isEqual(board, flatWinGrid)) {
			setText("Grid already solved ! (Duh...)")
			return
		}

		setText("Waiting solver response...")
		axios
			.post(`http://${location.hostname}:8081/solve`, {
				size: 4,
				board: board.map(e => e.toString()).join(" ")
			})
			.then(async ({ data }: { data: { status: string, solution: string, time: string, algo: string, fallback: boolean, workers: number } }) => {
				if (data.status == "OK" || data.status == "DB") {
					if (data.status == "OK")
						setText(`Found a solution of ${data.solution.length} move(s) in ${data.time} with ${data.algo} and ${data.algo !== "IDA*" ? data.workers : "1"} threads!`)
					if (data.status == "DB")
						setText(`Found a solution of ${data.solution.length} move(s) from the solution database (lazy is smart ;D)`)
					let newBoard = board
					for (let i = 0; i < data.solution.length; i++) {
						if (data.solution[i] == 'U')
							newBoard = moveUp(newBoard)
						if (data.solution[i] == 'D')
							newBoard = moveDown(newBoard)
						if (data.solution[i] == 'L')
							newBoard = moveLeft(newBoard)
						if (data.solution[i] == 'R')
							newBoard = moveRight(newBoard)
						setBoard(newBoard)
						await new Promise(r => setTimeout(r, 100))
					}
				}
			})
			.catch(e => {
				console.log("solver error : ", e)
				setText("Something went wrong solving the board. Hit the button again !")
			})
	}

	function addKeyboardHooks(e: KeyboardEvent) {
		e.preventDefault()
		if (e.key === "w" || e.key === "ArrowUp") {
			setBoard(moveUp(board))
			setText("Up")
		}
		if (e.key === "s" || e.key === "ArrowDown") {
			setBoard(moveDown(board))
			setText("Down")
		}
		if (e.key === "a" || e.key === "ArrowLeft") {
			setBoard(moveLeft(board))
			setText("Left")
		}
		if (e.key === "d" || e.key === "ArrowRight") {
			setBoard(moveRight(board))
			setText("Right")
		}
	}

	useEffect(() => {
		fetchBoard()
	}, [])

	useEffect(() => {
		window.addEventListener("keydown", addKeyboardHooks)
		return (() => {
			window.removeEventListener("keydown", addKeyboardHooks)
		})
	}, [board])

	useEffect(() => {
		if (isEqual(board, flatWinGrid))
			setText(`${text} and... WIN !`)
	}, [board])

	for (let i = 0; i < 4; i++) {
		rows.push(
			<Row key={i} index={i} input={board.slice(4 * i, 4 * (i + 1))}></Row>
		)
	}
	return (
		<>
			<Box {...handlers} sx={{ height: "100vh", touchAction: "none" }}>
				<Grid sx={{ margin: "auto", maxWidth: 800 }}>
					{rows}
				</Grid>
				<Box textAlign="center">
					<Button variant="contained" onClick={() => { fetchBoard(); setText("Successfully fetched a randomly generated grid !") }}>New Grid</Button>
					<Button variant="contained" onClick={solve}>Solve</Button>
				</Box>
				<Box textAlign="center">
					<p>{text}</p>
				</Box>
			</Box>
		</>
	)
}

function App() {
	const input: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	return (
		<Board input={input}></Board>
	)
}

export default App
