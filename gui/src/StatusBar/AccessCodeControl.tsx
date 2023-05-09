import { FunctionComponent, useCallback } from "react";
import { prompt } from "react-alert-async";
import { useAccessCode } from "../AccessCodeContext";
import Hyperlink from "../components/Hyperlink";

type Props = {
    // none
}

const accessCodeTooltip = `When an access code is set, you have the ability to edit files and run scripts. You can obtain a temporary access code from an administrator of this instance.`

const AccessCodeControl: FunctionComponent<Props> = () => {
    const {accessCode, setAccessCode} = useAccessCode()
    const handleSetAccessCode = useCallback(() => {
        (async () => {
            const newAccessCode = await prompt('Enter access code:')
            if (!newAccessCode) return
            setAccessCode(newAccessCode as string)
        })()
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