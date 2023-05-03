import { Done } from "@mui/icons-material";
import { FunctionComponent, useEffect, useState } from "react";

type Props = {
    width: number
    height: number
    modelStanText: string | undefined
}

type CompiledModel = {
    errors?: string[]
    warnings?: string[]
    result: string
}

const StanCompileResultWindow: FunctionComponent<Props> = ({width, height, modelStanText}) => {
    const [model, setModel] = useState<CompiledModel | undefined>(undefined)
    useEffect(() => {
        setModel(undefined)
        if (modelStanText === undefined) return
        const m = (window as any).stanc('model.stan', modelStanText, ["auto-format", "max-line-length=78"])
        setModel(m)
    }, [modelStanText])

    if (!model) return <div />
    if ((model.errors) && (model.errors.length > 0)) {
        return (
            <div style={{width, height, color: 'red', padding: 0, overflow: 'auto'}}>
                <h3>Errors</h3>
                {model.errors.map((error, i) => <div key={i} style={{font: 'courier', fontSize: 13}}><pre>{error}</pre></div>)}
            </div>
        )
    }
    if ((model.warnings) && (model.warnings.length > 0)) {
        return (
            <div style={{width, height, color: 'blue', padding: 0, overflow: 'auto'}}>
                <h3>Warnings</h3>
                {model.warnings.map((warning, i) => <div key={i} style={{font: 'courier', fontSize: 13}}><pre>{warning}</pre></div>)}
            </div>
        )
    }
    if (model.result === modelStanText) {
        return (<div style={{color: 'green'}}><Done /> canonical format</div>)
    }
    return (<div style={{color: 'green'}}><Done /></div>)
}

export default StanCompileResultWindow