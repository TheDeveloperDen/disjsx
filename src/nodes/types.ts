import { type ReactNode, type ReactElement } from "react";
import { type AnyComponentPayload } from "../types.js";
import { DISJSX } from "../disjsxTypes.js";

export interface NodeProcessor<TPayload = AnyComponentPayload, TProps = unknown> {
	process: (
		element: ReactElement<TProps>,
		processChildNode: (node: ReactNode) => unknown | null,
		processChildrenToString: (children: ReactNode, listIndentPrefix?: string) => string,
		getDISJSXType: (node: ReactNode, loop?: number) => DISJSX | undefined,
		getProcessedElement: (element: ReactElement, loop?: number) => ReactElement,
	) => TPayload | null;
}

export interface NodeProcessorContext {
	processChildNode: (node: ReactNode) => unknown | null;
	processChildrenToString: (children: ReactNode, listIndentPrefix?: string) => string;
	getDISJSXType: (node: ReactNode, loop?: number) => DISJSX | undefined;
	getProcessedElement: (element: ReactElement, loop?: number) => ReactElement;
}
