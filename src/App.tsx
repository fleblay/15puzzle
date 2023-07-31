import { Grid } from "@mui/material";

function Board() {
	return (
		<Grid container spacing={2} sx={{ margin: "auto" , border : "solid"}}>
			<Grid item xs={8} sx={{ border: "solid", borderColor: "blue", borderRadius: "20px" }}>
				<p>xs=8</p>
			</Grid>
			<Grid item xs={4}>
				<p>xs=4</p>
			</Grid>
			<Grid item xs={4}>
				<p>xs=4</p>
			</Grid>
			<Grid item xs={8}>
				<p>xs=8</p>
			</Grid>
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
