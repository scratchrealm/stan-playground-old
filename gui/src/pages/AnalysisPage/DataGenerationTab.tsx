import { serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useMemo, useState } from "react"
import { accessCodeHasExpired, useAccessCode } from "../../AccessCodeContext"
import Splitter from "../../components/Splitter"
import { useStatusBar } from "../../StatusBar/StatusBarContext"
import TextEditor, { ToolbarItem } from "../TextEditor"
import { AnalysisInfo, useAnalysisTextFile } from "../useAnalysisData"
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
    analysisInfo: AnalysisInfo | undefined
}

const DataGenerationTab: FunctionComponent<Props> = ({width, height, dataPyText, setDataPyText, refreshDataPyText, analysisId, onRefreshDataJson, analysisStatus, analysisInfo}) => {
    const {accessCode} = useAccessCode()
    const {text: dataConsoleText, refresh: refreshDataConsoleText} = useAnalysisTextFile(analysisId, analysisInfo, 'data.console.txt')
    const [dataPyEditedText, setDataPyEditedText] = useState<string | undefined>(undefined)

    const {setStatusBarMessage} = useStatusBar()

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
            setStatusBarMessage('Generating data...')
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'generate_analysis_data',
                    analysis_id: analysisId,
                    access_code: accessCode
                })
                if (!result.success) {
                    setStatusBarMessage('Data generation failed')
                    throw Error(`Error generating data: ${result.error}`)
                }
            } catch (err: any) {
                refreshDataConsoleText()
                setTimeout(() => {
                    setStatusBarMessage('Error generating data')
                    window.alert(`Error generating data: ${err.message}`)
                }, 200)
                return
            }
            refreshDataConsoleText()
            onRefreshDataJson()
            setTimeout(() => {
                setStatusBarMessage('Data generation complete')
            }, 200)
        })()
    }, [accessCode, analysisId, refreshDataConsoleText, onRefreshDataJson, setStatusBarMessage])
    const toolbarItems: ToolbarItem[] = useMemo(() => {
        if (dataPyEditedText !== dataPyText) return []
        if (analysisStatus !== 'none') return []
        return [
            {
                label: "generate",
                onClick: handleGenerate,
                color: 'darkgreen'
            }
        ]
    }, [handleGenerate, dataPyEditedText, dataPyText, analysisStatus])
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
                readOnly={(accessCode ? false : true) || (analysisStatus !== 'none')}
                toolbarItems={toolbarItems}
                onEditedTextChanged={setDataPyEditedText}
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