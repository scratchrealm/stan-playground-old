import React, { FunctionComponent, PropsWithChildren } from "react";

type Props ={
	onClick: () => void
	color?: string
}

const Hyperlink: FunctionComponent<PropsWithChildren<Props>> = ({children, onClick, color}) => {
	return (
		<a onClick={onClick} style={{cursor: 'pointer', color: color || 'darkblue'}}>{children}</a>
	)
}

export default Hyperlink
