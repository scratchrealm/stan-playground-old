import { FunctionComponent } from "react"
import { useAccessCode } from "../../AccessCodeContext"
import TextEditor from "../TextEditor"
import { AnalysisInfo } from "../useAnalysisData"


type Props = {
    width: number
    height: number
    dataJsonText: string | undefined
    setDataJsonText: (text: string) => void
    refreshDataJsonText: () => void
    analysisInfo: AnalysisInfo | undefined
}

const DataTab: FunctionComponent<Props> = ({width, height, dataJsonText, setDataJsonText, refreshDataJsonText, analysisInfo}) => {
    const {accessCode} = useAccessCode()
    return (
        <TextEditor
            width={width}
            height={height}
            language="json"
            label="data.json"
            text={dataJsonText}
            onSetText={setDataJsonText}
            onReload={refreshDataJsonText}
            readOnly={(accessCode ? false : true) || (analysisInfo?.status !== 'none')}
            wordWrap={true}
        />
    )
}

export default DataTab