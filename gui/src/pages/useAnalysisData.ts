import { getFileData, serviceQuery, useSignedIn } from "@figurl/interface"
import YAML from 'js-yaml'
import { useCallback, useEffect, useMemo, useState } from "react"
import { useStatusBar } from "../StatusBar/StatusBarContext"

export type AnalysisInfo = {
    status: 'none' | 'requested' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    user_id?: string
}

export const useAnalysisTextFile = (analysisId: string, analysisInfo: AnalysisInfo | undefined, name: string) => {
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
    const {userId} = useSignedIn()
    const setText = useCallback((text: string) => {
        if ((analysisInfo?.user_id) && (analysisInfo.user_id !== userId?.toString())) {
            window.alert(`You cannot edit this file because it is owned by by ${analysisInfo.user_id}.`)
            return
        }
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
    }, [analysisId, name, analysisInfo, userId])
    return {text: internalText, refresh, setText}
}

const useAnalysisData = (analysisId: string) => {
    const {text: analysisInfoText, refresh: refreshAnalysisInfo} = useAnalysisTextFile(analysisId, undefined, 'analysis.yaml')
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

    const {text: dataJsonText, setText: setDataJsonText, refresh: refreshDataJsonText} = useAnalysisTextFile(analysisId, analysisInfo, 'data.json')
    const {text: modelStanText, setText: setModelStanText, refresh: refreshModelStanText} = useAnalysisTextFile(analysisId, analysisInfo, 'model.stan')
    const {text: descriptionMdText, setText: setDescriptionMdText, refresh: refreshDescriptionMdText} = useAnalysisTextFile(analysisId, analysisInfo, 'description.md')
    const {text: optionsYamlText, setText: setOptionsYamlText, refresh: refreshOptionsYamlText} = useAnalysisTextFile(analysisId, analysisInfo, 'options.yaml')
    const {text: dataPyText, setText: setDataPyText, refresh: refreshDataPyText} = useAnalysisTextFile(analysisId, analysisInfo, 'data.py')

    const {setStatusBarMessage} = useStatusBar()

    const {userId} = useSignedIn()

    const setStatus = useCallback((status: string) => {
        (async () => {
            if ((analysisInfo?.user_id) && (analysisInfo.user_id !== userId?.toString())) {
                window.alert(`You cannot perform this action because this analysis is owned by by ${analysisInfo.user_id}.`)
                return
            }
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'set_analysis_status',
                    analysis_id: analysisId,
                    status
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
    }, [analysisId, refreshAnalysisInfo, setStatusBarMessage, userId, analysisInfo?.user_id])
    
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