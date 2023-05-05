import { FunctionComponent, useEffect } from "react";
import Hyperlink from "../../components/Hyperlink";
import TextEditor from "../TextEditor";
import { AnalysisInfo, useAnalysisTextFile } from "./useAnalysisData";

type Props = {
    width: number
    height: number
    analysisId: string
    canEdit: boolean
    analysisInfo: AnalysisInfo | undefined
    onRefreshStatus: () => void
    onQueueRun: () => void
    onDeleteRun: () => void
}

const RunSamplerTab: FunctionComponent<Props> = ({width, height, canEdit, analysisId, analysisInfo, onRefreshStatus, onQueueRun, onDeleteRun}) => {
    const {text: runConsoleText, refresh: refreshRunConsoleText} = useAnalysisTextFile(analysisId, analysisInfo, 'run.console.txt')

    const infoPanelWidth = Math.min(500, width / 2)

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
                    This analysis has not been run.
                    {canEdit && " You can queue it to run using the button below."}
                </p>
                <Hyperlink onClick={onQueueRun}>Queue run</Hyperlink>
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
                {canEdit && (
                    <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
                )}
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