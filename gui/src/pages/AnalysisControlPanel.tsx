import { getFileData, serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import { useAccessCode } from "../AccessCodeContext"
import Hyperlink from "../components/Hyperlink"
import { useStatusBar } from "../StatusBar/StatusBarContext"
import useRoute from "../useRoute"
import AccessCodeControl from "./AccessCodeControl"
import { AnalysisInfo } from "./useAnalysisData"

type Props = {
    analysisId: string
    analysisInfo: AnalysisInfo | undefined
    onRefreshAnalysisInfo: () => void
    onRequestRun: () => void
    onQueueRun: () => void
    onDeleteRun: () => void
    width: number
    height: number
}

const deleteAnalysisTooltip = `When you delete an analysis, it is flagged as deleted on the server and it will not show up on the list of analyses. This operation can be undone by the administrator.`
const cloneAnalysisTooltip = `When you clone an analysis, a new analysis is created with the same model, scripts, settings, etc. However, the run will be empty.`

const AnalysisControlPanel: FunctionComponent<Props> = ({analysisId, analysisInfo, onRefreshAnalysisInfo, onRequestRun, onQueueRun, onDeleteRun, width, height}) => {
    const {setRoute} = useRoute()
    const {accessCode} = useAccessCode()
    const {setStatusBarMessage} = useStatusBar()
    const status = analysisInfo !== undefined ? analysisInfo?.status || 'none' : 'undefined'
    const mcmcMonitorBaseUrl = useMcmcMonitorBaseUrl()
    const handleClone = useCallback(() => {
        // prompt the user if they are sure they want to clone this analysis
        if (!window.confirm('Are you sure you want to CLONE this analysis?')) return
        (async() => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'clone_analysis',
                analysis_id: analysisId
            }, {
                includeUserId: true
            })
            setRoute({page: 'analysis', analysisId: result.newAnalysisId})
            setTimeout(() => {
                // provide a popup box that says that the analysis has been clone and you are not viewing the clone
                setStatusBarMessage(`Analysis has been cloned. You are now viewing the clone.`)
            }, 500)
        })()
    }, [analysisId, setRoute, setStatusBarMessage])
    const handleDelete = useCallback(() => {
        // prompt the user if they are sure they want to delete this analysis
        if (!window.confirm('Are you sure you want to DELETE this analysis?')) return
        (async() => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'delete_analysis',
                analysis_id: analysisId
            }, {
                includeUserId: true
            })
            if (result.success) {
                setRoute({page: 'home'})
                setTimeout(() => {
                    // provide a popup box that says that the analysis has been deleted
                    setStatusBarMessage(`Analysis has been deleted.`)
                }, 500)
            }
        })()
    }, [analysisId, setRoute, setStatusBarMessage])
    return (
        <div style={{paddingLeft: 15, paddingTop: 15, fontSize: 14, userSelect: 'none'}}>
            <div><Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Back to analyses</Hyperlink></div>
            <hr />
            <div>Analysis: {analysisId}</div>
            <div>Status: <span style={{color: colorForStatus(status)}}>{status}</span> (<Hyperlink onClick={onRefreshAnalysisInfo}>refresh</Hyperlink>)</div>
            <hr />
            <div>{status === 'none' && (
                <span>
                    <p>
                        This analysis has not been run.
                    </p>
                    <p><Hyperlink onClick={onRequestRun}>Request run</Hyperlink></p>
                </span>
            )}</div>
            <div>{status === 'requested' && (
                <span>
                    <p>
                        This analysis has been requested to run. It is pending approval.
                    </p>
                    {
                        accessCode && (
                            <p><Hyperlink onClick={onQueueRun}>Queue run</Hyperlink></p>
                        )
                    }
                    <div>
                        <p><Hyperlink onClick={onDeleteRun}>Cancel run</Hyperlink></p>
                    </div>
                </span>
            )}</div>
            <div>{status === 'queued' && (
                <span>
                    <p>
                        This analysis has been queued to run. You can cancel this run by clicking the Cancel button below.
                    </p>
                    <p><Hyperlink onClick={onDeleteRun}>Cancel run</Hyperlink></p>
                </span>
            )}</div>
            <div>{status === 'running' && (
                <span>
                    <p>
                        This analysis is running.
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>Monitor the progress using <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <div>{status === 'completed' && (
                <span>
                    <p>
                        This analysis has completed.
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>View the output in <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                    <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
                </span>
            )}</div>
            <div>{status === 'failed' && (
                <span>
                    <p>
                        An error has occurred while running this analysis. You can delete this run using the button below.
                    </p>
                    <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
                    <p style={{color: 'red', wordWrap: 'break-word'}}>
                        {analysisInfo?.error}
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>You can <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">view the output if there is any using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <hr />
            {/* A clickable link to clone this analysis: */}
            <div style={{lineHeight: 2}} title={cloneAnalysisTooltip}><Hyperlink onClick={handleClone}>Clone this analysis</Hyperlink></div>
            {/* A clickable link to delete this analysis: */}
            <div style={{lineHeight: 2}} title={deleteAnalysisTooltip}><Hyperlink color="darkred" onClick={handleDelete}>Delete this analysis</Hyperlink></div>
            <hr />
            <AccessCodeControl />
        </div>
    )
}

const colorForStatus = (status: string) => {
    switch (status) {
        case 'none': return 'gray'
        case 'requested': return 'black'
        case 'queued': return 'orange'
        case 'running': return 'blue'
        case 'completed': return 'green'
        case 'failed': return 'red'
        default: return 'black'
    }
}

export const useMcmcMonitorBaseUrl = () => {
    const [mcmcMonitorUrl, setMcmcMonitorUrl] = useState<string | undefined>(undefined)
    useEffect(() => {
        (async () => {
            const a = await getFileData(`$dir/output/mcmc-monitor-url.txt`, () => {}, {responseType: 'text'})
            if (!a) {
                setMcmcMonitorUrl(undefined)
                return
            }
            setMcmcMonitorUrl(a)
        })()
    }, [])
    return mcmcMonitorUrl
}


export const createMcmcMonitorUrl = (mcmcMonitorBaseUrl: string, analysisId: string) => {
    if (!mcmcMonitorBaseUrl) return undefined
    return `${mcmcMonitorBaseUrl}#/run/${analysisId}`
}

export default AnalysisControlPanel