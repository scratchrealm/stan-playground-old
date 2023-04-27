import { FunctionComponent, useEffect } from "react";
import { useAccessCode } from "../../AccessCodeContext";
import Hyperlink from "../../components/Hyperlink";
import TextEditor from "../TextEditor";
import { AnalysisInfo, useAnalysisTextFile } from "../useAnalysisData";

type Props = {
    width: number
    height: number
    analysisId: string
    analysisInfo: AnalysisInfo | undefined
    onRefreshStatus: () => void
    onRequestRun: () => void
    onQueueRun: () => void
    onDeleteRun: () => void
}

const RunSamplerTab: FunctionComponent<Props> = ({width, height, analysisId, analysisInfo, onRefreshStatus, onRequestRun, onQueueRun, onDeleteRun}) => {
    const {text: runConsoleText, refresh: refreshRunConsoleText} = useAnalysisTextFile(analysisId, 'run.console.txt')

    const infoPanelWidth = Math.min(500, width / 2)

    const {accessCode} = useAccessCode()

    // whenever analysisInfo changes, refresh the run console text
    useEffect(() => {
        refreshRunConsoleText()
    }, [analysisInfo, refreshRunConsoleText])

    const infoPanel = (
        !analysisInfo ? (
            <div>No analysis info</div>
        ) : analysisInfo.status === 'none' ? (
            <div>
                <p>
                    This analysis has not been run. You can request that it be run using the button below.
                </p>
                <Hyperlink onClick={onRequestRun}>Request run</Hyperlink>
            </div>
        ) : analysisInfo.status === 'requested' ? (
            <div>
                <p>
                    This analysis has been requested to run, but not queued.
                </p>
                {
                    !accessCode ? (
                        <p>You do not have an access code set. You can ask an administrator of this instance to queue analysis {analysisId}.</p>
                    ) : (
                        <div>
                            <p>You have an access code set. Use the buttons below to queue or cancel the run.</p>
                            <p><Hyperlink onClick={onQueueRun}>Queue run</Hyperlink></p>
                            <p><Hyperlink onClick={onDeleteRun}>Cancel run</Hyperlink></p>
                        </div>
                    )
                }
            </div>
        ) : analysisInfo.status === 'queued' ? (
            <div>Analysis has been queued but not started. <Hyperlink onClick={onRefreshStatus}>Refresh status</Hyperlink></div>
        ) : analysisInfo.status === 'running' ? (
            <div>Analysis is running.</div>
        ) : analysisInfo.status === 'completed' ? (
            <div>
                <p>
                    Analysis run has completed.
                </p>
                <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
            </div>
        ) : analysisInfo.status === 'failed' ? (
            <div>Analysis has failed. Use the refresh button on the console output.</div>
        ) : (
            <div>Unknown analysis status: {analysisInfo.status}</div>
        )
    )

    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', width: infoPanelWidth, height}}>
                <div style={{padding: 20}}>
                    {infoPanel}
                </div>
            </div>
            <div style={{position: 'absolute', left: infoPanelWidth, width: width - infoPanelWidth, height}}>
                <TextEditor
                    width={width - infoPanelWidth}
                    height={height}
                    language="bash"
                    label="Run console output"
                    text={runConsoleText}
                    onSetText={() => {}}
                    onReload={refreshRunConsoleText}
                    readOnly={true}
                    wordWrap={false}
                />
            </div>
        </div>
    )
}

export default RunSamplerTab