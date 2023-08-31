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
	const [disabled, setDisabled] = useState<boolean>(false)
	const [text, setText] = useState<string>("")
	const rows: React.ReactElement[] = []

	useEffect(() => {
	}, [disabled])

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
		setText("Waiting server generating grid... ")
		axios
			.get(`https://${location.hostname}/15puzzle/api/generate/4`)
			.then(({ data }: { data: { size: number, board: string } }) => {
				const newboard: number[] = data.board.trim().split(" ").map(elem => +elem)
				setBoard(newboard)
				setText("Successfully fetched a randomly generated grid !")
			})
			.catch(e => {
				console.log("fetch error : ", e)
				setText("Something went wrong fetching a random board. Hit the button again !")
			})
	}

	function solve(algo: string) {
		if (isEqual(board, flatWinGrid)) {
			setText("Grid already solved ! (Duh...)")
			return
		}
		setText("Waiting solver response...")
		//setDisabled(true)
		axios
			.post(`https://${location.hostname}/15puzzle/api/solve/${algo}`, {
				size: 4,
				board: board.map(e => e.toString()).join(" ")
			},
				{
					timeout: 3600 * 1000
				})
			.then(async ({ data }: { data: { status: string, solution: string, time: string, algo: string, workers: number } }) => {
				if (data.status == "OK" || data.status == "DB") {
					if (data.status == "OK")
						setText(`Found a solution of ${data.solution.length} move(s) in ${data.time} with ${data.algo} and ${data.algo !== "IDA" ? data.workers : "1"} threads!`)
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
				} else if (data.status == "RAM" && data.algo == "A*") {
					setText(`Filled up server RAM in ${data.time}. You should try again with IDA, but beware, it may take some time...`)
				} else if (data.status == "RUNNING") {
					setText(`This grid is already being solved by the server. Wait a bit please !`)
				}
			})
			.catch(e => {
				console.log("solver error : ", e)
				setText("Something went wrong solving the board. Hit the button again !")
			})
			.finally(()=>{
				setDisabled(false)
			})
	}

	function addKeyboardHooks(e: KeyboardEvent, ) {
		e.preventDefault()
		if (disabled)
			return
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
	}, [board, disabled])

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
					<Button variant="contained" disabled={disabled} onClick={fetchBoard}>New Grid</Button>
					<Button variant="contained" disabled={disabled} onClick={() => solve("default")}>Solve</Button>
					<Button variant="contained" disabled={disabled} onClick={() => solve("astar")}>Solve with A*</Button>
					<Button variant="contained" disabled={disabled} onClick={() => solve("ida")}>Solve with IDA</Button>
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
