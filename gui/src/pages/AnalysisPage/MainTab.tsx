import { FunctionComponent, useCallback, useMemo, useState } from "react";
import Splitter from "../../components/Splitter";
import TextEditor, { ToolbarItem } from "../TextEditor";
import { AnalysisInfo } from "./useAnalysisData";
import StanCompileResultWindow from "./StanCompileResultWindow";
import runStanc from "./runStanc";

type Props = {
    width: number
    height: number
    analysisId: string
    canEdit: boolean
    mainStanText: string | undefined
    setMainStanText: (text: string) => void
    refreshMainStanText: () => void
    descriptionMdText: string | undefined
    setDescriptionMdText: (text: string) => void
    refreshDescriptionMdText: () => void
    optionsYamlText: string | undefined
    setOptionsYamlText: (text: string) => void
    refreshOptionsYamlText: () => void
    analysisInfo: AnalysisInfo | undefined
}

const MainTab: FunctionComponent<Props> = ({width, height, canEdit, mainStanText, setMainStanText, refreshMainStanText, descriptionMdText, setDescriptionMdText, refreshDescriptionMdText, optionsYamlText, setOptionsYamlText, refreshOptionsYamlText, analysisInfo}) => {
    // const {text: compileConsoleText, refresh: refreshCompileConsoleText} = useAnalysisTextFile(analysisId, 'compile.console.txt')
    const [mainStanEditedText, setMainStanEditedText] = useState<string | undefined>(undefined)

    // const {setStatusBarMessage} = useStatusBar()

    // const [compiling, setCompiling] = useState(false)

    // useEffect(() => {
    //     if (mainStanEditedText === undefined) return
    //     const model = (window as any).stanc('main.stan', mainStanEditedText)
    // }, [mainStanEditedText])

    // const handleCompile = useCallback(async () => {
    //     if (accessCodeHasExpired(accessCode)) {
    //         window.alert("Access code has expired")
    //         return
    //     }
    //     if (!accessCode) {
    //         window.alert("Access code has not been set")
    //         return
    //     }
    //     (async () => {
    //         let completed = false
    //         setCompiling(true)
    //         setStatusBarMessage('Compiling model...')
    //         // periodically refresh the console text while compilation is in progress
    //         const interval = setInterval(() => {
    //             if (completed) {
    //                 clearInterval(interval)
    //                 return
    //             }
    //             refreshCompileConsoleText()
    //         }, 1000)
    //         try {
    //             const {result} = await serviceQuery('stan-playground', {
    //                 type: 'compile_analysis_model',
    //                 analysis_id: analysisId,
    //                 access_code: accessCode
    //             })
    //             if (!result.success) {
    //                 setStatusBarMessage('Model compilation failed')
    //                 throw Error(`Error compiling model: ${result.error}`)
    //             }
    //         } catch (err: any) {
    //             refreshCompileConsoleText()
    //             setTimeout(() => {
    //                 setStatusBarMessage('Error compiling model')
    //                 window.alert(`Error compiling model: ${err.message}`)
    //             }, 200)
    //             return
    //         }
    //         finally {
    //             completed = true
    //             setCompiling(false)
    //         }
    //         refreshCompileConsoleText()
    //         setTimeout(() => {
    //             setStatusBarMessage('Model compilation complete')
    //         }, 200)
    //     })()
    // }, [accessCode, analysisId, refreshCompileConsoleText, setStatusBarMessage])

    const [editedMainStanTextOverrider, setEditedMainStanTextOverrider] = useState<(text: string) => void>()

    const handleEditedTextOverrider = useCallback((overrider: (text: string) => void) => {
        setEditedMainStanTextOverrider(() => overrider)
    }, [])

    const handleAutoFormat = useCallback(() => {
        if (mainStanEditedText === undefined) return
        if (editedMainStanTextOverrider === undefined) return
        ;(async () => {
            const model = await runStanc('main.stan', mainStanEditedText, ["auto-format", "max-line-length=78"])
            if (model.result) {
                editedMainStanTextOverrider(model.result)
            }
        })()
    }, [mainStanEditedText, editedMainStanTextOverrider])

    const modelReadOnly = useMemo(() => {
        return (!canEdit) || (analysisInfo?.status !== 'none')
    }, [analysisInfo, canEdit])

    const toolbarItems: ToolbarItem[] = useMemo(() => {
        const ret: ToolbarItem[] = []

        // // compile
        // if (mainStanEditedText === mainStanText) {
        //     if (analysisInfo?.status === 'none') {
        //         if (compiling) {
        //             ret.push({
        //                 label: "compiling...",
        //             })
        //         }        
        //         else {
        //             ret.push({
        //                 label: "compile",
        //                 onClick: handleCompile,
        //                 color: 'darkgreen'
        //             })
        //         }
        //     }
        // }

        // auto format
        if (!modelReadOnly) {
            if (mainStanEditedText !== undefined) {
                ret.push({
                    label: "auto format",
                    onClick: handleAutoFormat,
                    color: 'darkblue'
                })
            }
        }

        return ret
    }, [handleAutoFormat, mainStanEditedText, modelReadOnly])

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
                    // language="stan"
                    language="stan"
                    label="main.stan"
                    text={mainStanText}
                    onSetText={setMainStanText}
                    onReload={refreshMainStanText}
                    onEditedTextChanged={setMainStanEditedText}
                    onEditedTextOverrider={handleEditedTextOverrider}
                    readOnly={modelReadOnly}
                    toolbarItems={toolbarItems}
                />
                {
                    <StanCompileResultWindow
                        width={0}
                        height={0}
                        mainStanText={mainStanEditedText}
                    />
                }
                {/* <TextEditor
                    width={0}
                    height={0}
                    language="bash"
                    label="Compile output"
                    text={compileConsoleText}
                    onSetText={() => {}}
                    onReload={refreshCompileConsoleText}
                    readOnly={true}
                    wordWrap={false}
                /> */}
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
                    readOnly={!canEdit}
                />
                <TextEditor
                    width={0}
                    height={0}
                    language="yaml"
                    label="options.yaml"
                    text={optionsYamlText}
                    onSetText={setOptionsYamlText}
                    onReload={refreshOptionsYamlText}
                    readOnly={modelReadOnly}
                />
            </Splitter>
        </Splitter>
    )
}

export default MainTab