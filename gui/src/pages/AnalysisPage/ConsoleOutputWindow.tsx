import { FunctionComponent } from "react";
import TextEditor from "../TextEditor";

type Props = {
    width: number
    height: number
    text: string
    onReload: () => void
}

const ConsoleOutputWindow: FunctionComponent<Props> = ({width, height, text, onReload}) => {
    return (
        <TextEditor
            width={width}
            height={height}
            language="bash"
            label="console output"
            text={text}
            onSetText={() => {}}
            onReload={onReload}
            readOnly={true}
            theme="vs-dark"
        />
    )
}

export default ConsoleOutputWindow