import type { ReactElement } from "react";

/**
 * Reads a prop from an element whose props are not statically known (Fragments, HTML tags).
 */
export const getProp = (element: ReactElement, key: string): unknown =>
	typeof element.props === "object" && element.props !== null ? Reflect.get(element.props, key) : undefined;

/** Flattens nested arrays and drops `null`, `undefined` and booleans, like `Children.toArray` does for arrays. */
export const toNodeArray = (children: unknown): unknown[] => {
	if (Array.isArray(children)) {
		return children.flatMap(toNodeArray);
	}

	return children === null || children === undefined || typeof children === "boolean" ? [] : [children];
};

/** The children of an element whose props are not statically known, as a flat array. */
export const getChildren = (element: ReactElement): unknown[] => toNodeArray(getProp(element, "children"));
