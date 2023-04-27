import { getFileData, serviceQuery } from "@figurl/interface"
import YAML from 'js-yaml'
import { useCallback, useEffect, useMemo, useState } from "react"
import { useStatusBar } from "../StatusBar/StatusBarContext"

export type AnalysisInfo = {
    status: 'none' | 'requested' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
}

export const useAnalysisTextFile = (analysisId: string, name: string) => {
    const [internalText, setInternalText] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            setInternalText(undefined)
            try {
                const a = await readTextFile(`$dir/analyses/${analysisId}/${name}`)
                setInternalText(a)
            }
            catch (err) {
                console.warn(err)
                setInternalText('')
            }
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
            }, {
                includeUserId: true
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId, name])
    return {text: internalText, refresh, setText}
}

const useAnalysisData = (analysisId: string) => {
    const {text: dataJsonText, setText: setDataJsonText, refresh: refreshDataJsonText} = useAnalysisTextFile(analysisId, 'data.json')
    const {text: modelStanText, setText: setModelStanText, refresh: refreshModelStanText} = useAnalysisTextFile(analysisId, 'model.stan')
    const {text: descriptionMdText, setText: setDescriptionMdText, refresh: refreshDescriptionMdText} = useAnalysisTextFile(analysisId, 'description.md')
    const {text: optionsYamlText, setText: setOptionsYamlText, refresh: refreshOptionsYamlText} = useAnalysisTextFile(analysisId, 'options.yaml')
    const {text: dataPyText, setText: setDataPyText, refresh: refreshDataPyText} = useAnalysisTextFile(analysisId, 'data.py')
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

    const {setStatusBarMessage} = useStatusBar()

    const setStatus = useCallback((status: string, o: {accessCode?: string}={}) => {
        (async () => {
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'set_analysis_status',
                    analysis_id: analysisId,
                    status,
                    access_code: o.accessCode
                }, {
                    includeUserId: true
                })
                if (!result.success) {
                    throw new Error(result.error)
                }
            }
            catch(err: any) {
                setStatusBarMessage(err.message)
                window.alert(err.message)
            }
            finally {
                refreshAnalysisInfo()
            }
            
        })()
    }, [analysisId, refreshAnalysisInfo])
    
    return {
        modelStanText,
        dataJsonText,
        descriptionMdText,
        optionsYamlText,
        dataPyText,
        analysisInfo,
        setModelStanText,
        setDataJsonText,
        setDescriptionMdText,
        setOptionsYamlText,
        setDataPyText,
        refreshModelStanText,
        refreshDataJsonText,
        refreshDescriptionMdText,
        refreshOptionsYamlText,
        refreshDataPyText,
        setStatus,
        refreshAnalysisInfo
    }
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

export default useAnalysisData