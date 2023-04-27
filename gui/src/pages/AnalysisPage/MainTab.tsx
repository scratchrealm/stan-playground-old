import { serviceQuery } from "@figurl/interface";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { accessCodeHasExpired, useAccessCode } from "../../AccessCodeContext";
import Splitter from "../../components/Splitter";
import { useStatusBar } from "../../StatusBar/StatusBarContext";
import TextEditor, { ToolbarItem } from "../TextEditor";
import { AnalysisInfo, useAnalysisTextFile } from "../useAnalysisData";

type Props = {
    width: number
    height: number
    analysisId: string
    modelStanText: string | undefined
    setModelStanText: (text: string) => void
    refreshModelStanText: () => void
    descriptionMdText: string | undefined
    setDescriptionMdText: (text: string) => void
    refreshDescriptionMdText: () => void
    optionsYamlText: string | undefined
    setOptionsYamlText: (text: string) => void
    refreshOptionsYamlText: () => void
    analysisInfo: AnalysisInfo | undefined
}

const MainTab: FunctionComponent<Props> = ({width, height, analysisId, modelStanText, setModelStanText, refreshModelStanText, descriptionMdText, setDescriptionMdText, refreshDescriptionMdText, optionsYamlText, setOptionsYamlText, refreshOptionsYamlText, analysisInfo}) => {
    const {text: compileConsoleText, refresh: refreshCompileConsoleText} = useAnalysisTextFile(analysisId, 'compile.console.txt')
    const {accessCode} = useAccessCode()

    const [modelStanModified, setModelStanModified] = useState(false)

    const {setStatusBarMessage} = useStatusBar()

    const [compiling, setCompiling] = useState(false)

    const handleCompile = useCallback(async () => {
        if (accessCodeHasExpired(accessCode)) {
            window.alert("Access code has expired")
            return
        }
        if (!accessCode) {
            window.alert("Access code has not been set")
            return
        }
        (async () => {
            let completed = false
            setCompiling(true)
            setStatusBarMessage('Compiling model...')
            // periodically refresh the console text while compilation is in progress
            const interval = setInterval(() => {
                if (completed) {
                    clearInterval(interval)
                    return
                }
                refreshCompileConsoleText()
            }, 1000)
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'compile_analysis_model',
                    analysis_id: analysisId,
                    access_code: accessCode
                })
                if (!result.success) {
                    setStatusBarMessage('Model compilation failed')
                    throw Error(`Error compiling model: ${result.error}`)
                }
            } catch (err: any) {
                refreshCompileConsoleText()
                setTimeout(() => {
                    setStatusBarMessage('Error compiling model')
                    window.alert(`Error compiling model: ${err.message}`)
                }, 200)
                return
            }
            finally {
                completed = true
                setCompiling(false)
            }
            refreshCompileConsoleText()
            setTimeout(() => {
                setStatusBarMessage('Model compilation complete')
            }, 200)
        })()
    }, [accessCode, analysisId, refreshCompileConsoleText, setStatusBarMessage])

    const toolbarItems: ToolbarItem[] = useMemo(() => {
        if (modelStanModified) return []
        if (analysisInfo?.status !== 'none') return []
        if (compiling) return [{
            label: "compiling..."
        }]
        return [
            {
                label: "compile",
                onClick: handleCompile,
                color: 'darkgreen'
            }
        ]
    }, [handleCompile, modelStanModified, analysisInfo, compiling])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={width / 2}
            direction="horizontal"
        >
            <Splitter
                width={0}
                height={0}
                initialPosition={height * 2 / 3}
                direction="vertical"
            >
                <TextEditor
                    width={0}
                    height={0}
                    language="cpp"
                    label="model.stan"
                    text={modelStanText}
                    onSetText={setModelStanText}
                    onReload={refreshModelStanText}
                    onModifiedChanged={setModelStanModified}
                    readOnly={(accessCode ? false : true) || (analysisInfo?.status !== 'none')}
                    toolbarItems={toolbarItems}
                />
                <TextEditor
                    width={0}
                    height={0}
                    language="bash"
                    label="Compile output"
                    text={compileConsoleText}
                    onSetText={() => {}}
                    onReload={refreshCompileConsoleText}
                    readOnly={true}
                    wordWrap={false}
                />
            </Splitter>
            <Splitter
                width={0}
                height={0}
                initialPosition={height * 2 / 3}
                direction="vertical"
            >
                <TextEditor
                    width={0}
                    height={0}
                    language="markdown"
                    label="description.md"
                    text={descriptionMdText}
                    onSetText={setDescriptionMdText}
                    onReload={refreshDescriptionMdText}
                    wordWrap={true}
                    readOnly={(accessCode ? false : true)}
                />
                <TextEditor
                    width={0}
                    height={0}
                    language="yaml"
                    label="options.yaml"
                    text={optionsYamlText}
                    onSetText={setOptionsYamlText}
                    onReload={refreshOptionsYamlText}
                    readOnly={(accessCode ? false : true) || (analysisInfo?.status !== 'none')}
                />
            </Splitter>
        </Splitter>
    )
}

export default MainTab