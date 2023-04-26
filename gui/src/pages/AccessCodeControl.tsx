import { FunctionComponent, useCallback } from "react";
import { useAccessCode } from "../AccessCodeContext";
import Hyperlink from "../components/Hyperlink";

type Props = {
    // none
}

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
                        <span>Access code has been set</span>
                    ) : (
                        <span>Set access code</span>
                    )
                }
            </Hyperlink>
        </div>
    )
}

export default AccessCodeControl