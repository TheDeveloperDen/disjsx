import { getChildren } from "./children.js";
import { nodeProcessors, type ProcessorKind } from "./nodes/index.js";
import type { NodeOutput, NodeProcessor, ProcessedNode } from "./nodes/types.js";
import { processChildrenToString } from "./processChildrenToString.js";
import {
	resolveElement,
	type DISJSX,
	type DISJSXPropsMap,
	type ResolvedAs,
	type ResolvedElement,
} from "./disjsxTypes.js";
import { isValidElement, type JSXElementConstructor, type ReactElement, Fragment } from "react";

/**
 * Transforms a single React DISJSX component node into its corresponding JSON payload object.
 * This function is the core of the DISJSX to JSON transformation, mapping each
 * DISJSX component (e.g., <ActionRow>, <Button>, <Embed>) and its props to the
 * structure expected by the target API (presumably Discord).
 *
 * It recursively processes children for components that can contain other DISJSX elements
 * (like ActionRow or Container). For textual content within components like TextDisplay
 * or Embed fields, it utilizes `processChildrenToString` to convert JSX children
 * into formatted strings.
 *
 * @param node The React node to process. Expected to be a DISJSX component.
 * @returns A JSON payload object representing the component, or null if the node is invalid.
 */
export const processNode = <T extends NodeOutput = NodeOutput>(node: unknown): ProcessedNode<T> => {
	if (!isValidElement(node)) {
		return null;
	}

	const element = getProcessedElement(node);

	// Handle React Fragments by processing their children and returning them as an array
	if (element.type === Fragment) {
		const processedChildren = getChildren(element)
			.map((child) => processNode<T>(child))
			.filter((result) => result !== null);

		return processedChildren;
	}

	const resolved = resolveElement(element);

	if (!resolved || !hasProcessor(resolved)) {
		return null;
	}

	// should be safe based on the validation
	return processResolved(resolved.kind, resolved.element) as ProcessedNode<T>;
};

/**
 * Every processor, typed against {@link DISJSXPropsMap}. The assignment proves at compile time that each
 * processor takes the props its DISJSX type declares.
 */
const processors: { [K in ProcessorKind]: NodeProcessor<NodeOutput, DISJSXPropsMap[K], never> } = nodeProcessors;

const hasProcessor = (resolved: ResolvedElement): resolved is ResolvedAs<ProcessorKind> => resolved.kind in processors;

const processResolved = <K extends ProcessorKind>(
	kind: K,
	element: ReactElement<DISJSXPropsMap[K]>,
): NodeOutput | null =>
	processors[kind].process(element, processNode, processChildrenToString, getDISJSXType, getProcessedElement);

/**
 * Renders a function component. React class components cannot be called directly, so they are rejected.
 */
const renderComponent = (type: JSXElementConstructor<unknown>, props: unknown): unknown => {
	if (type.prototype?.isReactComponent) {
		throw new TypeError("DISJSX: Class components are not supported. Use a function component.");
	}

	// Not a class, so it is a function component. This cannot be expressed in the type system.
	return Reflect.apply(type, undefined, [props]);
};

/** How many custom components may wrap one another before we assume infinite recursion. */
const MAX_COMPONENT_NESTING = 100;

const assertWithinNestingLimit = (loop: number): void => {
	if (loop > MAX_COMPONENT_NESTING) {
		throw new RangeError(
			`DISJSX: custom components are nested more than ${MAX_COMPONENT_NESTING} levels deep (is a component rendering itself?).`,
		);
	}
};

/**
 * Helper function to get the DISJSX type from a React node.
 * Handles both direct elements and function components that return DISJSX elements.
 * @param node The React node to inspect.
 * @param loop The number of times the function has been called.
 * @returns The DISJSX type, or undefined if not a DISJSX component.
 */
export const getDISJSXType = (node: unknown, loop: number = 0): DISJSX | undefined => {
	assertWithinNestingLimit(loop);

	if (!isValidElement(node)) {
		return undefined;
	}

	const { type, props } = node;

	// Handle React Fragments - they should be treated as transparent
	if (type === Fragment) {
		return undefined;
	}

	const resolved = resolveElement(node);

	if (resolved) {
		return resolved.kind;
	}

	if (typeof type === "function") {
		// It's a regular functional component, try to render and recurse
		return getDISJSXType(renderComponent(type, props), loop + 1);
	}

	// If type is a string (e.g., "div", "span"), it's a host component.
	return undefined;
};

/**
 * Helper function to "unwrap" functional components until a host component
 * or a DISJSX component (with `disjsxType`) is reached.
 * @param element The React element to process.
 * @param loop The number of times the function has been called.
 * @returns The underlying host or DISJSX React element.
 * @throws TypeError if a functional component meant for unwrapping returns a non-element.
 */
export const getProcessedElement = (element: ReactElement, loop: number = 0): ReactElement => {
	assertWithinNestingLimit(loop);

	if (typeof element.type === "function" && !("disjsxType" in element.type)) {
		const renderedOutput = renderComponent(element.type, element.props);

		if (isValidElement(renderedOutput)) {
			return getProcessedElement(renderedOutput, loop + 1);
		}

		console.error(
			"Error in getProcessedElement: A functional component without 'disjsxType' returned a non-element or null. Element:",
			element,
			"Rendered output:",
			renderedOutput,
		);

		throw new TypeError("DISJSX: Functional component wrapper did not return a valid React element.");
	}

	return element;
};
