import { useSignedIn } from "@figurl/interface";
import { FunctionComponent, useCallback, useEffect, useMemo } from "react";
import AnalysisControlPanel from "../AnalysisControlPanel";
import { getLocalStorageAnalysisEditToken, setLocalStorageAnalysisAnalysisInfo, setLocalStorageAnalysisDescriptionMdText } from "../localStorageAnalyses";
import TabWidget from "../TabWidget/TabWidget";
import useAnalysisData from "./useAnalysisData";
import DataGenerationTab from "./DataGenerationTab";
import DataTab from "./DataTab";
import MainTab from "./MainTab";
import RunSamplerTab from "./RunSamplerTab";
import { confirm } from "react-alert-async";

type Props = {
    analysisId: string
    width: number
    height: number
}

const AnalysisPage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    // important to do this here just once rather than separately in the various editors
    const {modelStanText, dataJsonText, descriptionMdText, optionsYamlText, dataPyText, setDataPyText, analysisInfo, setModelStanText, setDataJsonText, setDescriptionMdText, setOptionsYamlText, refreshModelStanText, refreshDataJsonText, refreshDataPyText, refreshDescriptionMdText, refreshOptionsYamlText, setStatus, refreshAnalysisInfo} = useAnalysisData(analysisId)

    useEffect(() => {
        if (analysisInfo) {
            setLocalStorageAnalysisAnalysisInfo(analysisId, analysisInfo)
        }
        if (descriptionMdText) {
            setLocalStorageAnalysisDescriptionMdText(analysisId, descriptionMdText)
        }
    }, [analysisId, analysisInfo, descriptionMdText])

    const handleQueueRun = useCallback(() => {
        setStatus('queued')
    }, [setStatus])

    const handleDeleteRun = useCallback(() => {
        (async() => {
            // confirm that the user wants to delete the run
            if (!await confirm('Delete this run?')) return
            setStatus('none')
        })()
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

    const {userId} = useSignedIn()

    const canEdit = useMemo(() => {
        const editToken = getLocalStorageAnalysisEditToken(analysisId)
        if (editToken) return true
        if (analysisInfo?.owner_id) {
            if (userId?.toString() === analysisInfo.owner_id) return true
            else return false
        }
        else {
            return true
        }
    }, [analysisId, analysisInfo, userId])

    return (
        <div>
            <div style={{position: 'absolute', width: controlPanelWidth, height}}>
                <AnalysisControlPanel
                    width={controlPanelWidth}
                    height={height}
                    analysisId={analysisId}
                    canEdit={canEdit}
                    analysisInfo={analysisInfo}
                    onRefreshAnalysisInfo={refreshAnalysisInfo}
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
                    canEdit={canEdit}
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
                    canEdit={canEdit}
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
                    canEdit={canEdit}
                    dataJsonText={dataJsonText}
                    setDataJsonText={setDataJsonText}
                    refreshDataJsonText={refreshDataJsonText}
                    analysisInfo={analysisInfo}
                />
                <RunSamplerTab
                    width={0}
                    height={0}
                    analysisId={analysisId}
                    canEdit={canEdit}
                    analysisInfo={analysisInfo}
                    onRefreshStatus={refreshAnalysisInfo}
                    onQueueRun={handleQueueRun}
                    onDeleteRun={handleDeleteRun}
                />
            </TabWidget>  
            </div>
        </div>
    )
}

export default AnalysisPage