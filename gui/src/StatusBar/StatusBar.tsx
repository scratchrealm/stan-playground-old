import { FunctionComponent } from "react";
import { useStatusBar } from "./StatusBarContext";
import './StatusBar.css'
import AccessCodeControl from "./AccessCodeControl";

type Props = {
    width: number
    height: number
}

const StatusBar: FunctionComponent<Props> = ({width, height}) => {
    const {statusBarMessage} = useStatusBar()
    return (
        <div className="StatusBar" style={{position: 'absolute', width, height}}>
            <AccessCodeControl />&nbsp;&nbsp;&nbsp;
            {statusBarMessage}
        </div>
    )
}

export default StatusBar