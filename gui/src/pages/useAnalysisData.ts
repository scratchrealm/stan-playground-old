import { getFileData, readDir, serviceQuery } from "@figurl/interface"
import { useCallback, useEffect, useMemo, useState } from "react"
import YAML from 'js-yaml'

export type AnalysisInfo = {
    status: 'none' | 'requested' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
}

const useAnalysisTextFile = (analysisId: string, name: string) => {
    const [internalText, setInternalText] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            const a = await readTextFile(`$dir/analyses/${analysisId}/${name}`)
            setInternalText(a)
        })()
    }, [analysisId, name, refreshCode])
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const setText = useCallback((text: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name,
                text
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId, name])
    return {text: internalText, refresh, setText}
}

const useAnalysisData = (analysisId: string) => {
    const {text: dataJsonText, setText: setDataJsonText} = useAnalysisTextFile(analysisId, 'data.json')
    const {text: modelStanText, setText: setModelStanText} = useAnalysisTextFile(analysisId, 'model.stan')
    const {text: descriptionMdText, setText: setDescriptionMdText} = useAnalysisTextFile(analysisId, 'description.md')
    const {text: optionsYamlText, setText: setOptionsYamlText} = useAnalysisTextFile(analysisId, 'options.yaml')
    const {text: analysisInfoText, refresh: refreshAnalysisInfo} = useAnalysisTextFile(analysisId, 'analysis.yaml')

    const analysisInfo = useMemo(() => {
        if (!analysisInfoText) return undefined
        try {
            return YAML.load(analysisInfoText) as AnalysisInfo
        }
        catch (err) {
            console.warn('Problem loading yaml')
            console.warn(err)
            return undefined
        }
    }, [analysisInfoText])

    const setStatus = useCallback((status: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_status',
                analysis_id: analysisId,
                status
            })
            refreshAnalysisInfo()
        })()
    }, [analysisId, refreshAnalysisInfo])
    
    return {
        modelStanText,
        dataJsonText,
        descriptionMdText,
        optionsYamlText,
        analysisInfo,
        setModelStanText,
        setDataJsonText,
        setDescriptionMdText,
        setOptionsYamlText,
        setStatus
    }
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

const loadYaml = (text: string) => {
    try {
        return YAML.load(text) || {}
    }
    catch (err) {
        console.warn('Problem loading yaml')
        console.warn(err)
        return {}
    }
}

export default useAnalysisData