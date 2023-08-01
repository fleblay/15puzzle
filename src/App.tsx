import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import { SxProps } from "@mui/material/styles";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const commonStyles: SxProps = {
	border: 2,
	borderRadius: 1,
	margin: 0.5,
	aspectRatio: 1.2,
	fontWeight: 2,
	fontSize: "3em",
	backgroundColor: "lightsteelblue"
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
	const rows: React.ReactElement[] = []

	function fetchBoard() {
		axios
			.get("http://localhost:8081/generate/4", {
				headers: {
				}
			})
			.then(({ data }: { data: { size: number, board: string } }) => {
				const newboard: number[] = data.board.split(" ").map(elem => +elem)
				setBoard(newboard)
			})
	}

	useEffect(() => {
		fetchBoard()
	}, [])
	for (let i = 0; i < 4; i++) {
		rows.push(
			<Row key={i} index={i} input={board.slice(4 * i, 4 * (i + 1))}></Row>
		)
	}
	return (
		<>
			<Grid sx={{ margin: "auto", maxWidth: 800 }}>
				{rows}
			</Grid>
			<Button sx={{ height: 30, borderColor: "black", border: 2 }} onClick={fetchBoard}>Refresh Me</Button>
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
