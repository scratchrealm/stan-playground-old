import { AnalysisInfo } from "./AnalysisPage/useAnalysisData"

export type LocalStorageAnalysis = {
    analysisId: string
    editToken?: string
    descriptionMdText?: string
    analysisInfo?: AnalysisInfo
}

export const getLocalStorageAnalyses = (): LocalStorageAnalysis[] => {
    const s = localStorage.getItem('stan-playground-analyses')
    if (!s) return []
    try {
        return JSON.parse(s)
    }
    catch (err) {
        console.warn(err)
        return []
    }
}

export const getLocalStorageAnalysisEditToken = (analysisId: string): string | undefined => {
    const x = getLocalStorageAnalyses()
    const y = x.find(a => (a.analysisId === analysisId))
    if (!y) return undefined
    return y.editToken
}

export const addLocalStorageAnalysis = (lsAnalysis: LocalStorageAnalysis) => {
    const x = getLocalStorageAnalyses()
    const y = x.find(a => (a.analysisId === lsAnalysis.analysisId))
    if (y) {
        console.warn(`Analysis ${lsAnalysis.analysisId} already exists in local storage`)
        return
    }
    x.push(lsAnalysis)
    localStorage.setItem('stan-playground-analyses', JSON.stringify(x))
}

export const setLocalStorageAnalysisAnalysisInfo = (analysisId: string, analysisInfo: AnalysisInfo) => {
    const x = getLocalStorageAnalyses()
    const y = x.find(a => (a.analysisId === analysisId))
    if (y) {
        y.analysisInfo = analysisInfo
    } else {
        x.push({analysisId, analysisInfo})
    }
    localStorage.setItem('stan-playground-analyses', JSON.stringify(x))
}

export const setLocalStorageAnalysisDescriptionMdText = (analysisId: string, descriptionMdText: string) => {
    const x = getLocalStorageAnalyses()
    const y = x.find(a => (a.analysisId === analysisId))
    if (y) {
        y.descriptionMdText = descriptionMdText
    } else {
        x.push({analysisId, descriptionMdText})
    }
    localStorage.setItem('stan-playground-analyses', JSON.stringify(x))
}

export const deleteLocalStorageAnalysis = (analysisId: string) => {
    const x = getLocalStorageAnalyses()
    const y = x.filter(a => (a.analysisId !== analysisId))
    localStorage.setItem('stan-playground-analyses', JSON.stringify(y))
}