import { getFileData } from "@figurl/interface"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import Hyperlink from "../components/Hyperlink"
import useRoute from "../useRoute"
import { AnalysisConfig } from "./useAnalysisData"

type Props = {
    analysisId: string
    analysisConfig: AnalysisConfig | undefined
    onSetStatus: (status: string) => void
    width: number
    height: number
}

const AnalysisControlPanel: FunctionComponent<Props> = ({analysisId, analysisConfig, onSetStatus, width, height}) => {
    const {setRoute} = useRoute()
    const status = analysisConfig?.status || 'undefined'
    const handleRequestRun = useCallback(() => {
        onSetStatus('requested')
    }, [onSetStatus])
    const handleDeleteRun = useCallback(() => {
        onSetStatus('none')
    }, [onSetStatus])
    const mcmcMonitorUrl = useMcmcMonitorUrl(analysisId)
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
                        mcmcMonitorUrl ? (
                            <p>You can <a href={mcmcMonitorUrl} target="_blank" rel="noreferrer">monitor the progress using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <div>{status === 'finished' && (
                <span>
                    <p>
                        This analysis has completed.
                    </p>
                    {
                        mcmcMonitorUrl ? (
                            <p>You can <a href={mcmcMonitorUrl} target="_blank" rel="noreferrer">view the output using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <div>{status === 'error' && (
                <span>
                    <p>
                        An error has occurred while running this analysis. You can delete this run using the button below.
                    </p>
                    <button onClick={handleDeleteRun}>Delete run</button>
                    <p style={{color: 'red', wordWrap: 'break-word'}}>
                        {analysisConfig?.error}
                    </p>
                    {
                        mcmcMonitorUrl ? (
                            <p>You can <a href={mcmcMonitorUrl} target="_blank" rel="noreferrer">view the output if there is any using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
        </div>
    )
}

const useMcmcMonitorUrl = (analysisId: string) => {
    const [mcmcMonitorUrl, setMcmcMonitorUrl] = useState<string | undefined>(undefined)
    useEffect(() => {
        (async () => {
            const a = await getFileData(`$dir/output/mcmc-monitor-url.txt`, () => {}, {responseType: 'text'})
            if (!a) {
                setMcmcMonitorUrl(undefined)
                return
            }
            setMcmcMonitorUrl(`${a}#/run/${analysisId}`)
        })()
    }, [analysisId])
    return mcmcMonitorUrl
}

export default AnalysisControlPanel