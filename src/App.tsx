import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import { SxProps } from "@mui/material/styles";

const commonStyles: SxProps = {
	border: 2,
	borderRadius: 1,
	margin: 0.5,
	aspectRatio : 1.2,
}

function Board() {
	const cells: React.ReactElement[] = []
	for (let j = 0; j < 4; j++) {
		cells.push(
			<Grid container>
				<Grid item xs={3} >
					<Box sx={{ ...commonStyles }}>
					</Box>
				</Grid>
				<Grid item xs={3} >
					<Box sx={{ ...commonStyles, }}>
					</Box>
				</Grid>
				<Grid item xs={3} >
					<Box sx={{ ...commonStyles }}>
					</Box>
				</Grid>
				<Grid item xs={3} >
					<Box sx={{ ...commonStyles }}>
					</Box>
				</Grid>
			</Grid >
		)
	}
	return (
		<Grid sx={{ margin: "auto", maxWidth: 800}}>
			{cells}
		</Grid>
	)
}

function App() {

	return (
		<>
			<Board></Board>
		</>
	)
}

export default App
