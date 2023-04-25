import { serviceQuery } from "@figurl/interface";
import { FunctionComponent, useCallback } from "react";
import Hyperlink from "../components/Hyperlink";
import AnalysesTable from "./AnalysesTable";
import useSummary from "./useSummary";

type Props = {
    // none yet
}

const Home: FunctionComponent<Props> = () => {
    const {summary, refreshSummary} = useSummary()

    const handleCreateNewAnalysis = useCallback(() => {
        // Confirm that user wants to create a new analysis
        if (!window.confirm('Create a new analysis?')) return
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'create_analysis'
            })
            if (!result.newAnalysisId) throw new Error('Unexpected - no new analysis id')
            refreshSummary()
            setTimeout(() => {
                window.alert(`New analysis has been created.`)
            }, 500)
        })()
    }, [refreshSummary])

    return (
        <div style={{padding: 30}}>
            <h1>Stan playground</h1>
            <div>
                <Hyperlink onClick={handleCreateNewAnalysis}>Create new analysis</Hyperlink>
                &nbsp;|&nbsp;
                <a href="https://github.com/scratchrealm/stan-playground/blob/main/README.md" target="_blank" rel="noopener noreferrer">View documentation</a>
            </div>
            <AnalysesTable summary={summary} />
        </div>
    )
}

export default Home