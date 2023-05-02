import { serviceQuery } from "@figurl/interface";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import Hyperlink from "../components/Hyperlink";
import { useStatusBar } from "../StatusBar/StatusBarContext";
import useRoute from "../useRoute";
import AnalysesTable from "./AnalysesTable";
import { addLocalStorageAnalysis, getLocalStorageAnalyses } from "./localStorageAnalyses";
import useSummary, { Summary } from "./useSummary";

type Props = {
    width: number
    height: number
}

const Home: FunctionComponent<Props> = ({width, height}) => {
    const {summary, refreshSummary} = useSummary()

    const {setStatusBarMessage} = useStatusBar()

    const {setRoute} = useRoute()

    const handleCreateNewAnalysis = useCallback(() => {
        // Confirm that user wants to create a new analysis
        if (!window.confirm('Create a new analysis?')) return
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'create_analysis'
            }, {
                includeUserId: true
            })
            if (!result.success) {
                setStatusBarMessage(`Failed to create new analysis.`)
                return
            }
            if (!result.newAnalysisId) throw new Error('Unexpected - no new analysis id')
            addLocalStorageAnalysis({analysisId: result.newAnalysisId, editToken: result.editToken})
            refreshSummary()
            setRoute({page: 'analysis', analysisId: result.newAnalysisId})
            setTimeout(() => {
                setStatusBarMessage(`New analysis has been created.`)
            }, 500)
        })()
    }, [refreshSummary, setStatusBarMessage, setRoute])

    const [takingLongerThanExpected, setTakingLongerThanExpected] = useState(false)
    useEffect(() => {
        const a = setTimeout(() => {
            setTakingLongerThanExpected(true)
        }, 2500)
        return () => {
            clearTimeout(a)
        }
    }, [])

    const padding = 20

    const summaryFromLocalStorage: Summary = useMemo(() => {
        const lsAnalyses = getLocalStorageAnalyses()
        return {
            analyses: lsAnalyses.map(a => ({
                analysis_id: a.analysisId,
                title: '',
                status: a.analysisInfo?.status || 'undefined',
                owner_id: a.analysisInfo?.owner_id || '',
                data_size: 0,
                info: a.analysisInfo || {status: 'none'},
                description: a.descriptionMdText || '',
                stan_program: '',
                options: {}
            }))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summary]) // when summary is updated, we want to update this too

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
            <h3>Public analyses</h3>
            {
                summary ? (
                    <AnalysesTable summary={summary} />
                ) : (
                    !takingLongerThanExpected ? (
                        <div>Loading...</div>
                    ) : (
                        <div>Loading is taking longer than expected. You may want to try refreshing the page.</div>
                    )
                )
            }
            <h3>Your recent analyses</h3>
            <AnalysesTable summary={summaryFromLocalStorage} />
        </div>
    )
}

export default Home