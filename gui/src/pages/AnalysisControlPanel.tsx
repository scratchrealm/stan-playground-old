import { getFileData, serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import Hyperlink from "../components/Hyperlink"
import useRoute from "../useRoute"
import { AnalysisInfo } from "./useAnalysisData"

type Props = {
    analysisId: string
    analysisInfo: AnalysisInfo | undefined
    onSetStatus: (status: string) => void
    width: number
    height: number
}

const AnalysisControlPanel: FunctionComponent<Props> = ({analysisId, analysisInfo, onSetStatus, width, height}) => {
    const {setRoute} = useRoute()
    const status = analysisInfo !== undefined ? analysisInfo?.status || 'none' : 'undefined'
    const handleRequestRun = useCallback(() => {
        onSetStatus('requested')
    }, [onSetStatus])
    const handleDeleteRun = useCallback(() => {
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
        <div style={{paddingLeft: 15, paddingTop: 15, fontSize: 12}}>
            <div><Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Back to analyses</Hyperlink></div>
            <div>Analysis: {analysisId}</div>
            <div>Status: {status}</div>
            <div>{status === 'none' && (
                <span>
                    <p>
                        This analysis has not been run yet. You can request that it be run by clicking the Request button below.
                    </p>
                    <button onClick={handleRequestRun}>Request run</button>
                </span>
            )}</div>
            <div>{status === 'requested' && (
                <span>
                    <p>
                        This analysis has been requested to run. It is pending approval. You can cancel the request by clicking the Cancel button below.
                    </p>
                    <button onClick={handleDeleteRun}>Cancel run</button>
                </span>
            )}</div>
            <div>{status === 'queued' && (
                <span>
                    <p>
                        This analysis has been queued to run. You can cancel this run by clicking the Cancel button below.
                    </p>
                    <button onClick={handleDeleteRun}>Cancel run</button>
                </span>
            )}</div>
            <div>{status === 'running' && (
                <span>
                    <p>
                        This analysis is running.
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>You can <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">monitor the progress using MCMC Monitor</a></p>
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
                            <p>You can <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">view the output using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                    <button onClick={handleDeleteRun}>Delete run</button>
                </span>
            )}</div>
            <div>{status === 'failed' && (
                <span>
                    <p>
                        An error has occurred while running this analysis. You can delete this run using the button below.
                    </p>
                    <button onClick={handleDeleteRun}>Delete run</button>
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
            <div><Hyperlink onClick={handleClone}>Clone this analysis</Hyperlink></div>
            {/* A clickable link to delete this analysis: */}
            <div><Hyperlink color="darkred" onClick={handleDelete}>Delete this analysis</Hyperlink></div>
        </div>
    )
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