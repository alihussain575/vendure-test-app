import { langs } from "@uiw/codemirror-extensions-langs";
import { useCodeMirror } from "@uiw/react-codemirror";
import React, { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

const extensions = [langs["html"](), langs["css"](), langs["javascript"]()];

export default function TemplateEditor({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
	form: UseFormReturn<any>;
}) {
	const editor = useRef<HTMLDivElement>(null);

	const { setContainer } = useCodeMirror({
		container: editor.current,
		extensions,
		value,
		onChange: (value, viewUpdate) => {
			onChange(value);
		},
		height: "700px",
	});

	useEffect(() => {
		if (editor.current) {
			setContainer(editor.current);
		}
	}, [editor.current]);

	return (
		<>
			<div ref={editor} />
		</>
	);
}
