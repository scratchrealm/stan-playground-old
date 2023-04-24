import { FunctionComponent, useCallback } from "react"
import TextEditor from "./TextEditor"
import useAnalysisData from "./useAnalysisData"

type Props = {
    analysisId: string
    width: number
    height: number
}

const ModelStanTextEditor: FunctionComponent<Props> = ({analysisId, width, height}) => {
    const {modelStanText, setModelStanText} = useAnalysisData(analysisId)
    const handleSetText = useCallback((text: string) => {
        setModelStanText(text)
    }, [setModelStanText])
    return (
        <TextEditor
            width={width}
            height={height}
            language="cpp"
            label="model.stan"
            text={modelStanText}
            onSetText={handleSetText}
        />
    )
}

export default ModelStanTextEditor