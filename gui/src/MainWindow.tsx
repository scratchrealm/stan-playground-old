import { startListeningToParent, useWindowDimensions } from "@figurl/interface";
import { FunctionComponent } from "react";
import AnalysisPage from "./pages/AnalysisPage/AnalysisPage";
import Home from "./pages/Home";
import useRoute from "./useRoute";

const MainWindow: FunctionComponent = () => {
	const {route} = useRoute()
	const {width, height} = useWindowDimensions()
    return (
		route.page === 'home' ? (
			<Home />
		) : route.page === 'analysis' ? (
			<AnalysisPage analysisId={route.analysisId} width={width} height={height} />
		) : (
			<div>Unknown page: {(route as any).page}</div>
		)
	)
}

startListeningToParent()

export default MainWindow