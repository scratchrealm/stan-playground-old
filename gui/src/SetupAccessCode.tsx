import { FunctionComponent, PropsWithChildren, useEffect, useRef, useState } from "react"
import AccessCodeContext from "./AccessCodeContext"

const SetupAccessCode: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [accessCode, setAccessCode] = useState<string>('')
    const initialized = useRef<boolean>(false)

    useEffect(() => {
        // get the access code from local storage
        const accessCode = localStorage.getItem('stan-playground-access-code')
        if (accessCode !== null) {
            setAccessCode(accessCode)
        }
        initialized.current = true
    }, [])

    // when access code changes, save it to local storage
    useEffect(() => {
        // don't save the access code to local storage on the first render
        if (!initialized.current) return
        localStorage.setItem('stan-playground-access-code', accessCode)
    }, [accessCode])

    return (
        <AccessCodeContext.Provider value={{ accessCode, setAccessCode }}>
            {children}
        </AccessCodeContext.Provider>
    )
}

export default SetupAccessCode