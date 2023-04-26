import { getFileData, serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import { useAccessCode } from "../AccessCodeContext"
import Hyperlink from "../components/Hyperlink"
import useRoute from "../useRoute"
import AccessCodeControl from "./AccessCodeControl"
import { AnalysisInfo } from "./useAnalysisData"

type Props = {
    analysisId: string
    analysisInfo: AnalysisInfo | undefined
    onRefreshAnalysisInfo: () => void
    onSetStatus: (status: string, o?: {accessCode?: string}) => void
    width: number
    height: number
}

const AnalysisControlPanel: FunctionComponent<Props> = ({analysisId, analysisInfo, onRefreshAnalysisInfo, onSetStatus, width, height}) => {
    const {setRoute} = useRoute()
    const {accessCode} = useAccessCode()
    const status = analysisInfo !== undefined ? analysisInfo?.status || 'none' : 'undefined'
    const handleRequestRun = useCallback(() => {
        onSetStatus('requested')
    }, [onSetStatus])
    const handleQueueRun = useCallback(() => {
        onSetStatus('queued', {accessCode})
    }, [onSetStatus, accessCode])
    const handleDeleteRun = useCallback(() => {
        // confirm that the user wants to delete the run
        if (!window.confirm('Delete this run?')) return
        onSetStatus('none')
    }, [onSetStatus])
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
                window.alert(`Analysis has been cloned. You are now viewing the clone.`)
            }, 500)
        })()
    }, [analysisId, setRoute])
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
                    window.alert(`Analysis has been deleted.`)
                }, 500)
            }
        })()
    }, [analysisId, setRoute])
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
                        This analysis has not been run yet. You can request that it be run by clicking the Request button below.
                    </p>
                    <Hyperlink onClick={handleRequestRun}>Request run</Hyperlink>
                </span>
            )}</div>
            <div>{status === 'requested' && (
                <span>
                    <p>
                        This analysis has been requested to run. It is pending approval.
                    </p>
                    {
                        accessCode && (
                            <Hyperlink onClick={handleQueueRun}>Queue run</Hyperlink>
                        )
                    }
                    <div>
                        <Hyperlink onClick={handleDeleteRun}>Cancel run</Hyperlink>
                    </div>
                </span>
            )}</div>
            <div>{status === 'queued' && (
                <span>
                    <p>
                        This analysis has been queued to run. You can cancel this run by clicking the Cancel button below.
                    </p>
                    <Hyperlink onClick={handleDeleteRun}>Cancel run</Hyperlink>
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
                    <Hyperlink onClick={handleDeleteRun}>Delete run</Hyperlink>
                </span>
            )}</div>
            <div>{status === 'failed' && (
                <span>
                    <p>
                        An error has occurred while running this analysis. You can delete this run using the button below.
                    </p>
                    <Hyperlink onClick={handleDeleteRun}>Delete run</Hyperlink>
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
            <div style={{lineHeight: 2}}><Hyperlink onClick={handleClone}>Clone this analysis</Hyperlink></div>
            {/* A clickable link to delete this analysis: */}
            <div style={{lineHeight: 2}}><Hyperlink color="darkred" onClick={handleDelete}>Delete this analysis</Hyperlink></div>
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