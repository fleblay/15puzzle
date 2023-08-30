import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import { SxProps } from "@mui/material/styles";
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { SwipeableHandlers, useSwipeable } from "react-swipeable";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const commonStyles: SxProps = {
	border: 2,
	borderRadius: 1,
	margin: 0.5,
	aspectRatio: 1.2,
	backgroundColor: "lightsteelblue"
}

type Pos2D = {
	X: number,
	Y: number,
}

var swipeConfig = {
	preventScrollOnSwipe: true,
}

var flatSnailWinGrid: number[] = [1, 2, 3, 4, 12, 13, 14, 5, 11, 0, 15, 6, 10, 9, 8, 7]
var flatRegularWinGrid: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]

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

function revertSolution(solution: string): string {
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

function formatSolution(text: string, divideCount: number): string {
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

function handleCellClick(custom: boolean, row: number, column: number, input: number[], updateBoard: React.Dispatch<React.SetStateAction<number[]>>) {
	let biggest: number = 0
	input.forEach(e => { biggest = (biggest < e && e != 0) ? e : biggest })
	if (custom) {
		if (input[row * 4 + column] == 0 && biggest < 15)
			input[row * 4 + column] = biggest + 1
		else if (input[row * 4 + column] == biggest)
			input[row * 4 + column] = 0
		updateBoard([...input])
	}
}

function Row({ win, custom, index, input, updateBoard }: { win: boolean, custom: boolean, index: number, input: number[], updateBoard: React.Dispatch<React.SetStateAction<number[]>> }) {
	const cells: React.ReactElement[] = []

	for (let i = 0; i < 4; i++) {
		cells.push(
			<Grid key={`${index}.${i}`} item xs={3} >
				<Box display="flex" justifyContent="center" alignItems="center" sx={{ ...commonStyles }} onClick={(e) => { e.preventDefault(); handleCellClick(custom, index, i, input, updateBoard) }}>
					<Typography sx={{ color: win ? "green" : "black", fontSize: "8vw", opacity: input[4 * index + i] != 0 ? 1 : 0 }}>
						{input[4 * index + i]}
					</Typography>
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
	const [previousBoard, setPreviousBoard] = useState<number[]>(board)
	const [customBoard, setCustomBoard] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
	const [custom, setCustom] = useState<boolean>(false)
	const [disabled, setDisabled] = useState<boolean>(false)
	const [text, setText] = useState<string>("")
	const [solution, setSolution] = useState<string>("")
	const [allowPreviousCompute, setAllowPreviousCompute] = useState<boolean>(true)
	const [revertMoves, setRevertMoves] = useState<boolean>(false)
	const [snailDisposition, setSnailDisposition] = useState<boolean>(false)
	const [win, setWin] = useState<boolean>(false)

	const handlers = swipeableSelector(revertMoves)

	function swipeableSelector(revert: boolean): SwipeableHandlers {
		if (revert) {
			return useSwipeable({
				onSwipedUp: () => {
					setBoard(moveDown(board))
				},
				onSwipedDown: () => {
					setBoard(moveUp(board))
				},
				onSwipedLeft: () => {
					setBoard(moveRight(board))
				},
				onSwipedRight: () => {
					setBoard(moveLeft(board))
				},
				...swipeConfig
			});
		} else {
			return useSwipeable({
				onSwipedUp: () => {
					setBoard(moveUp(board))
				},
				onSwipedDown: () => {
					setBoard(moveDown(board))
				},
				onSwipedLeft: () => {
					setBoard(moveLeft(board))
				},
				onSwipedRight: () => {
					setBoard(moveRight(board))
				},
				...swipeConfig
			});
		}
	}

	function fetchBoard() {
		const disposition = snailDisposition ? "snail" : "zerolast"
		setSolution("")
		setText("Waiting for the server to generate a grid... ")
		axios
			.get(`https://${location.hostname}/15puzzle/api/generate/4/${disposition}`)
			.then(({ data }: { data: { size: number, board: string } }) => {
				const newboard: number[] = data.board.trim().split(" ").map(elem => +elem)
				setBoard(newboard)
				setPreviousBoard(newboard)
				setText("Successfully fetched a randomly generated grid !")
			})
			.catch(e => {
				console.log("fetch error : ", e)
				setText("Something went wrong fetching a random grid")
			})
	}

	function solve(algo: string, previousCompute: boolean) {
		const currentBoard = custom ? customBoard : board
		if (win) {
			setText("Grid already solved ! (Duh...)")
			return
		}
		setSolution("")
		setText("Waiting solver response...")
		setDisabled(true)
		axios
			.post(`https://${location.hostname}/15puzzle/api/solve/${algo}`, {
				size: 4,
				board: currentBoard.map(e => e.toString()).join(" "),
				previousCompute,
				disposition: snailDisposition ? "snail" : "zerolast"
			},
				{
					timeout: 3600 * 1000
				})
			.then(async ({ data }: { data: { status: string, solution: string, time: string, algo: string, fallback: boolean, workers: number } }) => {
				if (data.status == "OK" || data.status == "DB") {
					console.log("Here is the solution you smarty-pants ;P : ", data.solution)
					if (!revertMoves) {
						setSolution(formatSolution(data.solution, 10))
					} else {
						setSolution(formatSolution(revertSolution(data.solution), 10))
					}
					if (data.status == "OK")
						setText(`Found a solution of ${data.solution.length} move(s) in ${data.time} with ${data.algo} and ${data.algo !== "IDA" ? data.workers : "1"} threads!`)
					if (data.status == "DB")
						setText(`Found a solution of ${data.solution.length} move(s) from the solution database (lazy is smart ;D). First compute was with ${data.algo} in ${data.time}`)
					let newBoard = currentBoard
					for (let i = 0; i < data.solution.length; i++) {
						if (data.solution[i] == 'U')
							newBoard = moveUp(newBoard)
						if (data.solution[i] == 'D')
							newBoard = moveDown(newBoard)
						if (data.solution[i] == 'L')
							newBoard = moveLeft(newBoard)
						if (data.solution[i] == 'R')
							newBoard = moveRight(newBoard)
						if (!custom)
							setBoard(newBoard)
						else
							setCustomBoard(newBoard)
						await new Promise(r => setTimeout(r, 100))
					}
				} else if (data.status == "RAM") {
					setText(`Filled up server RAM in ${data.time}. You should try again with IDA, but beware, it may take some time...`)
				} else if (data.status == "RUNNING") {
					setText(`This grid is already being solved by the server. Wait a bit please !`)
				} else if (data.status == "BUSY") {
					setText(`Server is already processing a grid with A*. Please wait or use IDA`)
				} else if (data.status == "PARAM") {
					setText(`Something is wrong regarding the board : ${data.solution}`)
				} else if (data.status == "FLAGS") {
					setText(`Backend solver was not initialized properly : ${data.solution}`)
				}
			})
			.catch(e => {
				console.log("solver error : ", e)
				setText("Something went wrong solving the board. Try again !")
			})
			.finally(() => {
				setDisabled(false)
			})
	}

	function keyBoardHooksSelector(revert: boolean): (e: KeyboardEvent) => void {
		if (revert)
			return addRevertedKeyboardHooks
		else
			return addKeyboardHooks
	}

	function addRevertedKeyboardHooks(e: KeyboardEvent) {
		e.preventDefault()
		if (disabled)
			return
		if (e.key === "w" || e.key === "ArrowUp") {
			setBoard(moveDown(board))
		}
		if (e.key === "s" || e.key === "ArrowDown") {
			setBoard(moveUp(board))
		}
		if (e.key === "a" || e.key === "ArrowLeft") {
			setBoard(moveRight(board))
		}
		if (e.key === "d" || e.key === "ArrowRight") {
			setBoard(moveLeft(board))
		}
	}

	function addKeyboardHooks(e: KeyboardEvent) {
		e.preventDefault()
		if (disabled)
			return
		if (e.key === "w" || e.key === "ArrowUp") {
			setBoard(moveUp(board))
		}
		if (e.key === "s" || e.key === "ArrowDown") {
			setBoard(moveDown(board))
		}
		if (e.key === "a" || e.key === "ArrowLeft") {
			setBoard(moveLeft(board))
		}
		if (e.key === "d" || e.key === "ArrowRight") {
			setBoard(moveRight(board))
		}
	}

	useEffect(() => {
		fetchBoard()
	}, [])

	useEffect(() => {
		window.addEventListener("keydown", keyBoardHooksSelector(revertMoves))
		return (() => {
			window.removeEventListener("keydown", keyBoardHooksSelector(revertMoves))
		})
	}, [board, disabled, revertMoves])

	useEffect(() => {
		let flatWinGrid = snailDisposition ? flatSnailWinGrid : flatRegularWinGrid
		if (isEqual(board, flatWinGrid))
			setWin(true)
		else
			setWin(false)
	}, [board, snailDisposition])

	function handlePrevious(event: React.BaseSyntheticEvent) {
		setAllowPreviousCompute(event.target.checked)
	}

	function handleRevert(event: React.BaseSyntheticEvent) {
		setRevertMoves(event.target.checked)
		setSolution(revertSolution(solution))
	}

	return (
		<>
			<Box {...handlers} sx={{ height: "100vh", touchAction: "none" }}>
				<Grid sx={{ margin: "auto", maxWidth: 800 }}>
					{
						[...Array(4)].map((_, i) => <Row win={win} custom={custom} key={i} index={i} input={custom ? customBoard : board} updateBoard={setCustomBoard}></Row>)
					}
				</Grid>
				<Box textAlign="center">
					<Button variant="contained" disabled={disabled} onClick={() => { if (custom) { setCustom(false) } else { fetchBoard() } }}>New Grid</Button>
					<Button variant="contained" disabled={disabled} onClick={() => solve("astar", allowPreviousCompute)}>Solve with A*</Button>
					<Button variant="contained" disabled={disabled} onClick={() => solve("ida", allowPreviousCompute)}>Solve with IDA</Button>
					<Button variant="contained" disabled={disabled} onClick={() => { if (!custom) { setBoard(previousBoard) } else { setCustomBoard([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) } }}>Reset {custom ? "Custom" : ""} Board</Button>
					<Button variant="contained" disabled={disabled} onClick={() => { setCustom(!custom) }}>Switch to {custom ? "Random" : "Custom"}</Button>
					<Button variant="contained" disabled={disabled} onClick={() => { setSnailDisposition(!snailDisposition) }}>Switch to {snailDisposition ? "Standard" : "Snail"}</Button>
				</Box>
				<Box>
					<FormGroup sx={{ display: "flex", flexFlow: "row wrap" }}>
						<FormControlLabel sx={{ margin: "auto" }} control={<Checkbox sx={{ padding: "2px 9px" }} defaultChecked />} onChange={handlePrevious} label="Allow previously computed solutions" />
						<FormControlLabel sx={{ margin: "auto" }} control={<Checkbox sx={{ padding: "2px 9px" }} />} onChange={handleRevert} label="Revert Moves" />
					</FormGroup>
				</Box>
				<Box textAlign="center">
					<Typography>{text}</Typography>
					<Typography>{solution}</Typography>
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
