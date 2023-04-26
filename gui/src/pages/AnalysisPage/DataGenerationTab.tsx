import { serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useMemo, useState } from "react"
import { accessCodeHasExpired, useAccessCode } from "../../AccessCodeContext"
import Splitter from "../../components/Splitter"
import TextEditor, { ToolbarItem } from "../TextEditor"
import { useAnalysisTextFile } from "../useAnalysisData"
import ConsoleOutputWindow from "./ConsoleOutputWindow"

type Props = {
    width: number
    height: number
    dataPyText: string | undefined
    setDataPyText: (text: string) => void
    refreshDataPyText: () => void
    analysisId: string
    onRefreshDataJson: () => void
    analysisStatus: string | undefined
}

const DataGenerationTab: FunctionComponent<Props> = ({width, height, dataPyText, setDataPyText, refreshDataPyText, analysisId, onRefreshDataJson, analysisStatus}) => {
    const {accessCode} = useAccessCode()
    const {text: dataConsoleText, refresh: refreshDataConsoleText} = useAnalysisTextFile(analysisId, 'data.console.txt')
    const [dataPyModified, setDataPyModified] = useState(false)
    const handleGenerate = useCallback(() => {
        if (accessCodeHasExpired(accessCode)) {
            window.alert("Access code has expired")
            return
        }
        if (!accessCode) {
            window.alert("Access code has not been set")
            return
        }
        (async () => {
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'generate_analysis_data',
                    analysis_id: analysisId,
                    access_code: accessCode
                })
                if (!result.success) {
                    throw Error(`Error generating data: ${result.error}`)
                }
            } catch (err: any) {
                refreshDataConsoleText()
                setTimeout(() => {
                    window.alert(`Error generating data: ${err.message}`)
                }, 200)
                return
            }
            refreshDataConsoleText()
            onRefreshDataJson()
            setTimeout(() => {
                window.alert('Data generation complete')
            }, 200)
        })()
    }, [accessCode, analysisId, refreshDataConsoleText, onRefreshDataJson])
    const toolbarItems: ToolbarItem[] = useMemo(() => {
        if (dataPyModified) return []
        if (analysisStatus !== 'none') return []
        return [
            {
                label: "generate",
                onClick: handleGenerate,
                color: 'darkgreen'
            }
        ]
    }, [handleGenerate, dataPyModified, analysisStatus])
    return (
        <Splitter
            width={width}
            height={height}
            direction="horizontal"
            initialPosition={width / 2}
        >
            <TextEditor
                width={0}
                height={0}
                language="python"
                label="data.py"
                text={dataPyText}
                onSetText={setDataPyText}
                onReload={refreshDataPyText}
                readOnly={false}
                toolbarItems={toolbarItems}
                onModifiedChanged={setDataPyModified}
            />
            <ConsoleOutputWindow
                text={dataConsoleText || ''}
                onReload={refreshDataConsoleText}
                width={0}
                height={0}
            />
        </Splitter>
    )
}

export default DataGenerationTab