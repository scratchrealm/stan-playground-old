import { FunctionComponent } from "react";
import Splitter from "../components/Splitter";
import AnalysisControlPanel from "./AnalysisControlPanel";
import TextEditor from "./TextEditor";
import useAnalysisData from "./useAnalysisData";

type Props = {
    analysisId: string
    width: number
    height: number
}

const AnalysisPage: FunctionComponent<Props> = ({analysisId, width, height}) => {
    // important to do this here just once rather than separately in the various editors
    const {modelStanText, dataJsonText, descriptionMdText, optionsYamlText, analysisInfo, setModelStanText, setDataJsonText, setDescriptionMdText, setOptionsYamlText, setStatus} = useAnalysisData(analysisId)

    const controlPanelWidth = 200
    return (
        <div>
            <div style={{position: 'absolute', width: controlPanelWidth, height}}>
                <AnalysisControlPanel
                    width={controlPanelWidth}
                    height={height}
                    analysisId={analysisId}
                    analysisInfo={analysisInfo}
                    onSetStatus={setStatus}
                />
            </div>
            <div style={{position: 'absolute', left: controlPanelWidth, width: width - controlPanelWidth, height}}>
                <Splitter
                    width={width - controlPanelWidth}
                    height={height}
                    initialPosition={(width - controlPanelWidth) / 2}
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
                            readOnly={analysisInfo?.status !== 'none'}
                        />
                        <TextEditor
                            width={0}
                            height={0}
                            language="json"
                            label="data.json"
                            text={dataJsonText}
                            onSetText={setDataJsonText}
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
                            wordWrap={true}
                        />
                        <TextEditor
                            width={0}
                            height={0}
                            language="yaml"
                            label="options.yaml"
                            text={optionsYamlText}
                            onSetText={setOptionsYamlText}
                            readOnly={analysisInfo?.status !== 'none'}
                        />
                    </Splitter>
                </Splitter>
            </div>
        </div>
    )
}

export default AnalysisPage