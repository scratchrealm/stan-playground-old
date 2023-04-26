import { FunctionComponent } from "react";
import Splitter from "../../components/Splitter";
import AnalysisControlPanel from "../AnalysisControlPanel";
import DataGenerationTab from "./DataGenerationTab";
import TabWidget from "../TabWidget/TabWidget";
import TextEditor from "../TextEditor";
import useAnalysisData, { AnalysisInfo } from "../useAnalysisData";

type Props = {
    analysisId: string
    width: number
    height: number
}

const controlPanelWidth = 200

const AnalysisPage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    const {modelStanText, dataJsonText, descriptionMdText, optionsYamlText, dataPyText, setDataPyText, analysisInfo, setModelStanText, setDataJsonText, setDescriptionMdText, setOptionsYamlText, refreshModelStanText, refreshDataJsonText, refreshDataPyText, refreshDescriptionMdText, refreshOptionsYamlText, setStatus, refreshAnalysisInfo} = useAnalysisData(analysisId)

    return (
        <div>
            <div style={{position: 'absolute', width: controlPanelWidth, height}}>
                <AnalysisControlPanel
                    width={controlPanelWidth}
                    height={height}
                    analysisId={analysisId}
                    analysisInfo={analysisInfo}
                    onRefreshAnalysisInfo={refreshAnalysisInfo}
                    onSetStatus={setStatus}
                />
            </div>
            <div style={{position: 'absolute', left: controlPanelWidth, width: width - controlPanelWidth, height}}>
            <TabWidget
                width={width - controlPanelWidth}
                height={height}
                tabs={[
                    {label: 'Main', closeable: false},
                    {label: 'Data generation', closeable: false}
                ]}
            >
                <AnalysisPageMainTab
                    width={0}
                    height={0}
                    modelStanText={modelStanText}
                    setModelStanText={setModelStanText}
                    refreshModelStanText={refreshModelStanText}
                    dataJsonText={dataJsonText}
                    setDataJsonText={setDataJsonText}
                    refreshDataJsonText={refreshDataJsonText}
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
                    onRefreshDataJson={refreshDataJsonText}
                    analysisStatus={analysisInfo?.status}
                />
            </TabWidget>  
            </div>
        </div>
    )
}

type MainTabProps = {
    width: number
    height: number
    modelStanText: string | undefined
    setModelStanText: (text: string) => void
    refreshModelStanText: () => void
    dataJsonText: string | undefined
    setDataJsonText: (text: string) => void
    refreshDataJsonText: () => void
    descriptionMdText: string | undefined
    setDescriptionMdText: (text: string) => void
    refreshDescriptionMdText: () => void
    optionsYamlText: string | undefined
    setOptionsYamlText: (text: string) => void
    refreshOptionsYamlText: () => void
    analysisInfo: AnalysisInfo | undefined
}

const AnalysisPageMainTab: FunctionComponent<MainTabProps> = ({width, height, modelStanText, setModelStanText, refreshModelStanText, dataJsonText, setDataJsonText, refreshDataJsonText, descriptionMdText, setDescriptionMdText, refreshDescriptionMdText, optionsYamlText, setOptionsYamlText, refreshOptionsYamlText, analysisInfo}) => {
    // important to do this here just once rather than separately in the various editors
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
        >
            <Splitter
                width={0}
                height={0}
                initialPosition={height * 2 / 3}
                direction="vertical"
            >
                <TextEditor
                    width={0}
                    height={0}
                    language="cpp"
                    label="model.stan"
                    text={modelStanText}
                    onSetText={setModelStanText}
                    onReload={refreshModelStanText}
                    readOnly={analysisInfo?.status !== 'none'}
                />
                <TextEditor
                    width={0}
                    height={0}
                    language="json"
                    label="data.json"
                    text={dataJsonText}
                    onSetText={setDataJsonText}
                    onReload={refreshDataJsonText}
                    readOnly={analysisInfo?.status !== 'none'}
                    wordWrap={true}
                />
            </Splitter>
            <Splitter
                width={0}
                height={0}
                initialPosition={height * 2 / 3}
                direction="vertical"
            >
                <TextEditor
                    width={0}
                    height={0}
                    language="markdown"
                    label="description.md"
                    text={descriptionMdText}
                    onSetText={setDescriptionMdText}
                    onReload={refreshDescriptionMdText}
                    wordWrap={true}
                />
                <TextEditor
                    width={0}
                    height={0}
                    language="yaml"
                    label="options.yaml"
                    text={optionsYamlText}
                    onSetText={setOptionsYamlText}
                    onReload={refreshOptionsYamlText}
                    readOnly={analysisInfo?.status !== 'none'}
                />
            </Splitter>
        </Splitter>
    )
}

export default AnalysisPage