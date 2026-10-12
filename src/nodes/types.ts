import { type ReactNode, type ReactElement } from "react";
import type {
	APIActionRowComponent,
	APIComponentInActionRow,
	APIEmbed,
	APIMessageComponent,
	APIModalComponent,
} from "discord-api-types/v10";
import { DISJSX } from "../disjsxTypes.js";

/**
 * Anything a node processor can produce: a message component, a modal component, or an embed.
 * An action row is processed before its position is known, so it can hold any row child.
 */
export type NodeOutput =
	| APIMessageComponent
	| APIModalComponent
	| APIEmbed
	| APIActionRowComponent<APIComponentInActionRow>;

/**
 * The result of processing a node: a single output, `null` if the node produced nothing,
 * or an array when the node was a Fragment.
 */
export type ProcessedNode<T extends NodeOutput = NodeOutput> = T | ProcessedNode<T>[] | null;

/** Flattens a {@link ProcessedNode} into a plain array, dropping `null`s and unwrapping Fragments at any depth. */
export const flattenProcessed = <T extends NodeOutput>(processed: ProcessedNode<T>): T[] =>
	processed === null
		? []
		: Array.isArray(processed)
			? processed.flatMap((item) => flattenProcessed<T>(item))
			: [processed];

/**
 * @typeParam TPayload What the processor produces.
 * @typeParam TProps The props of the element it processes.
 * @typeParam TChild The kinds of child output this processor accepts from `processChildNode`.
 */
export interface NodeProcessor<TPayload = NodeOutput, TProps = unknown, TChild extends NodeOutput = NodeOutput> {
	process: (
		element: ReactElement<TProps>,
		processChildNode: (node: ReactNode) => ProcessedNode<TChild>,
		processChildrenToString: (children: ReactNode, listIndentPrefix?: string) => string,
		getDISJSXType: (node: ReactNode, loop?: number) => DISJSX | undefined,
		getProcessedElement: (element: ReactElement, loop?: number) => ReactElement,
	) => TPayload | null;
}

export interface NodeProcessorContext {
	processChildNode: (node: ReactNode) => ProcessedNode;
	processChildrenToString: (children: ReactNode, listIndentPrefix?: string) => string;
	getDISJSXType: (node: ReactNode, loop?: number) => DISJSX | undefined;
	getProcessedElement: (element: ReactElement, loop?: number) => ReactElement;
}
