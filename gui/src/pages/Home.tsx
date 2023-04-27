import { serviceQuery } from "@figurl/interface";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../components/Hyperlink";
import { useStatusBar } from "../StatusBar/StatusBarContext";
import AnalysesTable from "./AnalysesTable";
import useSummary from "./useSummary";

type Props = {
    width: number
    height: number
}

const Home: FunctionComponent<Props> = ({width, height}) => {
    const {summary, refreshSummary} = useSummary()

    const {setStatusBarMessage} = useStatusBar()

    const handleCreateNewAnalysis = useCallback(() => {
        // Confirm that user wants to create a new analysis
        if (!window.confirm('Create a new analysis?')) return
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'create_analysis'
            }, {
                includeUserId: true
            })
            if (!result.newAnalysisId) throw new Error('Unexpected - no new analysis id')
            refreshSummary()
            setTimeout(() => {
                setStatusBarMessage(`New analysis has been created.`)
            }, 500)
        })()
    }, [refreshSummary, setStatusBarMessage])

    const padding = 20

    return (
        <div style={{position: 'absolute', left: padding, top: padding, width: width - padding * 2, height: height - padding * 2, overflowY: 'auto'}}>
            <h1>Stan playground</h1>
            <div>
                <Hyperlink onClick={handleCreateNewAnalysis}>Create new analysis</Hyperlink>
                &nbsp;|&nbsp;
                <Hyperlink onClick={refreshSummary}>Refresh table</Hyperlink>
                &nbsp;|&nbsp;
                <a href="https://github.com/scratchrealm/stan-playground/blob/main/README.md" target="_blank" rel="noopener noreferrer">View documentation</a>
            </div>
            {
                summary ? <AnalysesTable summary={summary} /> : <div>Loading...</div>
            }
        </div>
    )
}

export default Home