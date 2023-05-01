import { FunctionComponent, useCallback, useEffect } from "react";
import AnalysisControlPanel from "../AnalysisControlPanel";
import TabWidget from "../TabWidget/TabWidget";
import useAnalysisData from "../useAnalysisData";
import DataGenerationTab from "./DataGenerationTab";
import DataTab from "./DataTab";
import MainTab from "./MainTab";
import RunSamplerTab from "./RunSamplerTab";

type Props = {
    analysisId: string
    width: number
    height: number
}

const AnalysisPage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    // important to do this here just once rather than separately in the various editors
    const {modelStanText, dataJsonText, descriptionMdText, optionsYamlText, dataPyText, setDataPyText, analysisInfo, setModelStanText, setDataJsonText, setDescriptionMdText, setOptionsYamlText, refreshModelStanText, refreshDataJsonText, refreshDataPyText, refreshDescriptionMdText, refreshOptionsYamlText, setStatus, refreshAnalysisInfo} = useAnalysisData(analysisId)

    const handleRequestRun = useCallback(() => {
        setStatus('requested')
    }, [setStatus])

    const handleQueueRun = useCallback(() => {
        setStatus('queued')
    }, [setStatus])

    const handleDeleteRun = useCallback(() => {
        // confirm that the user wants to delete the run
        if (!window.confirm('Delete this run?')) return
        setStatus('none')
    }, [setStatus])

    // if the status is queued or running, refresh that analysisInfo periodically
    useEffect(() => {
        if (analysisInfo?.status === 'queued' || analysisInfo?.status === 'running') {
            const interval = setInterval(() => {
                refreshAnalysisInfo()
            }, 5000)
            return () => {
                clearInterval(interval)
            }
        }
    }, [analysisInfo, refreshAnalysisInfo])

    const controlPanelWidth = Math.max(200, Math.min(300, width / 6))

    return (
        <div>
            <div style={{position: 'absolute', width: controlPanelWidth, height}}>
                <AnalysisControlPanel
                    width={controlPanelWidth}
                    height={height}
                    analysisId={analysisId}
                    analysisInfo={analysisInfo}
                    onRefreshAnalysisInfo={refreshAnalysisInfo}
                    onRequestRun={handleRequestRun}
                    onQueueRun={handleQueueRun}
                    onDeleteRun={handleDeleteRun}
                />
            </div>
            <div style={{position: 'absolute', left: controlPanelWidth, width: width - controlPanelWidth, height}}>
            <TabWidget
                width={width - controlPanelWidth}
                height={height}
                tabs={[
                    {label: 'Main', closeable: false},
                    {label: 'Data generation', closeable: false},
                    {label: 'Data', closeable: false},
                    {label: 'Run', closeable: false}
                ]}
            >
                <MainTab
                    width={0}
                    height={0}
                    analysisId={analysisId}
                    modelStanText={modelStanText}
                    setModelStanText={setModelStanText}
                    refreshModelStanText={refreshModelStanText}
                    descriptionMdText={descriptionMdText}
                    setDescriptionMdText={setDescriptionMdText}
                    refreshDescriptionMdText={refreshDescriptionMdText}
                    optionsYamlText={optionsYamlText}
                    setOptionsYamlText={setOptionsYamlText}
                    refreshOptionsYamlText={refreshOptionsYamlText}
                    analysisInfo={analysisInfo}
                />
                <DataGenerationTab
                    width={0}
                    height={0}
                    dataPyText={dataPyText}
                    setDataPyText={setDataPyText}
                    refreshDataPyText={refreshDataPyText}
                    analysisId={analysisId}
                    analysisInfo={analysisInfo}
                    onRefreshDataJson={refreshDataJsonText}
                    analysisStatus={analysisInfo?.status}
                />
                <DataTab
                    width={0}
                    height={0}
                    dataJsonText={dataJsonText}
                    setDataJsonText={setDataJsonText}
                    refreshDataJsonText={refreshDataJsonText}
                    analysisInfo={analysisInfo}
                />
                <RunSamplerTab
                    width={0}
                    height={0}
                    analysisId={analysisId}
                    analysisInfo={analysisInfo}
                    onRefreshStatus={refreshAnalysisInfo}
                    onRequestRun={handleRequestRun}
                    onQueueRun={handleQueueRun}
                    onDeleteRun={handleDeleteRun}
                />
            </TabWidget>  
            </div>
        </div>
    )
}

export default AnalysisPage