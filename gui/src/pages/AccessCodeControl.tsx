import { FunctionComponent, useCallback } from "react";
import { useAccessCode } from "../AccessCodeContext";
import Hyperlink from "../components/Hyperlink";

type Props = {
    // none
}

const accessCodeTooltip = `When an access code is set, you have the ability to compile models, generate data, and queue runs. You can obtain a temporary access code from an administrator of this instance.`

const AccessCodeControl: FunctionComponent<Props> = () => {
    const {accessCode, setAccessCode} = useAccessCode()
    const handleSetAccessCode = useCallback(() => {
        const newAccessCode = window.prompt('Enter access code:')
        if (newAccessCode === null) return
        setAccessCode(newAccessCode)
    }, [setAccessCode])
    return (
        <div>
            <Hyperlink onClick={handleSetAccessCode} color={accessCode ? 'darkgreen' : 'darkred'}>
                {
                    accessCode ? (
                        <p title={accessCodeTooltip}>Access code has been set</p>
                    ) : (
                        <p>Set access code</p>
                    )
                }
            </Hyperlink>
        </div>
    )
}

export default AccessCodeControl