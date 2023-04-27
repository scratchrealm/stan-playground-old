import { FunctionComponent, useCallback } from "react";
import { useAccessCode } from "../AccessCodeContext";
import Hyperlink from "../components/Hyperlink";

type Props = {
    // none
}

const accessCodeTooltip = `When an access code is set, you have the ability to edit files and run scripts. You can obtain a temporary access code from an administrator of this instance.`

const AccessCodeControl: FunctionComponent<Props> = () => {
    const {accessCode, setAccessCode} = useAccessCode()
    const handleSetAccessCode = useCallback(() => {
        const newAccessCode = window.prompt('Enter access code:')
        if (newAccessCode === null) return
        setAccessCode(newAccessCode)
    }, [setAccessCode])
    return (
        <Hyperlink onClick={handleSetAccessCode} color={accessCode ? 'darkgreen' : 'darkred'}>
            {
                accessCode ? (
                    <span title={accessCodeTooltip}>access code has been set</span>
                ) : (
                    <span>set access code</span>
                )
            }
        </Hyperlink>
    )
}

export default AccessCodeControl