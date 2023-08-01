import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import { SxProps } from "@mui/material/styles";
import { Button } from "@mui/material";
import {useEffect, useState} from "react";
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

function Row({index, input }: {index :number, input: number[] }) {
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

function Board({ input }: { input: number[][] }) {
	const [fetchInfo, setFetchInfo] = useState<boolean>(false)
	let gofetch = false
	const rows: React.ReactElement[] = []

	useEffect(()=>{
		axios
		.get("http://localhost:8081/generate/4", {headers : {
			}})
		.then(({data}) => {
			console.log(data)
			setFetchInfo(!fetchInfo)
			})
		}, [gofetch])
	for (let i = 0; i < 4; i++) {
		rows.push(
			<Row key={i} index={i} input={input[i]}></Row>
		)
	}
	return (
		<>
			<Grid sx={{ margin: "auto", maxWidth: 800 }}>
				{rows}
			</Grid>
			<Button onClick={()=>{gofetch = !gofetch}}></Button>
		</>
	)
}

function App() {
	const input: number[][] = [
		[1, 2, 3, 4],
		[5, 6, 7, 8],
		[9, 10, 11, 12],
		[13, 14, 15, 0],
	]
	return (
		<>
			<Board input={input}></Board>
		</>
	)
}

export default App
