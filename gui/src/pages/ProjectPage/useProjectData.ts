import { getFileData, serviceQuery } from "@figurl/interface"
import YAML from 'js-yaml'
import { useCallback, useEffect, useMemo, useState } from "react"

export const useProjectTextFile = (projectId: string | undefined, name: string) => {
    const [internalText, setInternalText] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            setInternalText(undefined)
            if (!projectId) return
            try {
                const a = await readTextFile(`$dir/projects/${projectId}/${name}`)
                setInternalText(a)
            }
            catch (err) {
                console.warn(err)
                setInternalText('')
            }
        })()
    }, [projectId, name, refreshCode])
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const setText = useCallback((text: string) => {
        if (!projectId) return
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'set_project_text_file',
                project_id: projectId,
                name,
                text
            }, {
                includeUserId: true
            })
            if (!result.success) {
                throw new Error(result.error)
            }
            setRefreshCode(c => (c + 1))
        })()
    }, [projectId, name])
    return {text: internalText, refresh, setText}
}

export type ProjectConfig = {
    project_id: string
    owner_id: string
    users: {
        user_id: string
    }[]
}

const useProjectData = (projectId?: string) => {
    const {text: projectConfigText, refresh: refreshProjectConfig} = useProjectTextFile(projectId, 'project.yaml')
    const projectConfig = useMemo(() => {
        if (!projectConfigText) return undefined
        try {
            return YAML.load(projectConfigText) as ProjectConfig
        }
        catch (err) {
            console.warn('Problem loading yaml')
            console.warn(err)
            return undefined
        }
    }, [projectConfigText])

    const {text: descriptionMdText, setText: setDescriptionMdText, refresh: refreshDescriptionMdText} = useProjectTextFile(projectId, 'description.md')

    return {
        descriptionMdText,
        projectConfig,
        setDescriptionMdText,
        refreshDescriptionMdText,
        refreshProjectConfig
    }
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

export default useProjectData