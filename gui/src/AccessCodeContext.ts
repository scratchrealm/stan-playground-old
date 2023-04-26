import React from "react";

export type AccessCodeContextType = {
    accessCode: string
    setAccessCode: (accessCode: string) => void
}

const AccessCodeContext = React.createContext<AccessCodeContextType>({
    accessCode: '',
    setAccessCode: () => {}
});

export const useAccessCode = () => {
    const context = React.useContext(AccessCodeContext)
    if (!context) {
        throw new Error('useAccessCode must be used within a AccessCodeProvider')
    }
    return context
}

export const accessCodeHasExpired = (accessCode: string) => {
    if (!accessCode) return false
    const parts = accessCode.split('.')
    if (parts.length !== 2) return false
    const exp = parseInt(parts[1])
    if (isNaN(exp)) return false
    return (Date.now() / 1000) > exp
}

export default AccessCodeContext