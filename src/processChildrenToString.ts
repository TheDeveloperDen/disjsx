import { getProp, toNodeArray } from "./children.js";
import { getProcessedElement } from "./utils.js";
import { isValidElement } from "react";

/**
 * A set of HTML-like block-level element types.
 * This is used by `processChildrenToString` to determine appropriate newline handling
 * when converting React nodes to a string representation, ensuring block elements
 * are typically on new lines.
 */
export const blockElementTypes: Set<string> = new Set([
	"h1",
	"h2",
	"h3",
	"p",
	"small",
	"blockquote",
	"ul",
	"ol",
	"pre",
]);

/**
 * Recursively processes React children nodes and converts them into a single string,
 * applying markdown-like formatting for various HTML-like elements.
 *
 * This function handles basic text, numbers, and a curated set of HTML-like tags
 * (e.g., h1-h3, strong, em, ul, ol, li, blockquote, code, pre, a, br, p, small).
 * It manages spacing and newlines, particularly differentiating between inline
 * and block-level elements (defined in `blockElementTypes`) to produce a
 * readable string output.
 *
 * @param childrenNodes The React nodes to process.
 * @param listIndentPrefix A string prefix used for indenting list items, accumulates with nesting.
 * @returns A string representation of the processed React nodes.
 */
export const processChildrenToString = (childrenNodes: unknown, listIndentPrefix: string = ""): string => {
	if (!childrenNodes) {
		return "";
	}
	const nodes = Array.isArray(childrenNodes) ? childrenNodes : [childrenNodes];
	let resultString = "";
	let previousNodeWasBlock = true;

	for (const rawCurrentNode of nodes) {
		if (rawCurrentNode === null || rawCurrentNode === undefined) {
			continue;
		}

		if (Array.isArray(rawCurrentNode)) {
			const nestedContent = processChildrenToString(rawCurrentNode, listIndentPrefix);

			resultString += nestedContent;
			previousNodeWasBlock = nestedContent.endsWith("\n") || previousNodeWasBlock;
			continue;
		}

		if (typeof rawCurrentNode === "string" || typeof rawCurrentNode === "number") {
			resultString += String(rawCurrentNode);
			previousNodeWasBlock = false;
			continue;
		}

		if (!isValidElement(rawCurrentNode)) {
			previousNodeWasBlock = false; // Assuming non-elements don't act as blocks

			continue;
		}

		const element = getProcessedElement(rawCurrentNode);
		const { type } = element;
		const children = getProp(element, "children");
		const currentElementTypeStr = typeof type === "string" ? type : "";
		const isCurrentNodeHtmlBlock = blockElementTypes.has(currentElementTypeStr);

		if (isCurrentNodeHtmlBlock && !previousNodeWasBlock && resultString.length > 0 && !resultString.endsWith("\n")) {
			resultString += "\n";
		}

		let elementContent = "";

		if (typeof type === "string") {
			switch (type) {
				case "h1": {
					elementContent = `# ${processChildrenToString(children, "")}\n`;
					break;
				}
				case "h2": {
					elementContent = `## ${processChildrenToString(children, "")}\n`;
					break;
				}
				case "h3": {
					elementContent = `### ${processChildrenToString(children, "")}\n`;
					break;
				}
				case "strong":
				case "b": {
					elementContent = `**${processChildrenToString(children, listIndentPrefix)}**`;
					break;
				}
				case "i":
				case "em": {
					elementContent = `*${processChildrenToString(children, listIndentPrefix)}*`;
					break;
				}
				case "u": {
					elementContent = `__${processChildrenToString(children, listIndentPrefix)}__`;
					break;
				}
				case "s":
				case "strike": {
					elementContent = `~~${processChildrenToString(children, listIndentPrefix)}~~`;
					break;
				}
				case "small": {
					elementContent = `-# ${processChildrenToString(children, "")}\n`;
					break;
				}
				case "blockquote": {
					const bqContent = processChildrenToString(children, "");
					const lines = bqContent.split("\n").filter((line) => line.trim().length > 0);

					elementContent = lines.map((line) => `> ${line}`).join("\n") + (lines.length > 0 ? "\n" : "");
					break;
				}
				case "a": {
					const href = String(getProp(element, "href") || "");
					const linkTextContent = processChildrenToString(children, listIndentPrefix);
					const linkText = linkTextContent.trim() || href;

					elementContent = getProp(element, "isEscaped") ? `[${linkText}](<${href}>)` : `[${linkText}](${href})`;
					break;
				}
				case "ul": {
					const items = toNodeArray(children);

					for (const itemNode of items) {
						if (!isValidElement(itemNode) || itemNode.type !== "li") {
							continue;
						}
						const liContent = processChildrenToString(getProp(itemNode, "children"), listIndentPrefix + "  ");
						const liLines = liContent.trim().split("\n");

						elementContent += `${listIndentPrefix}- ${liLines[0] || ""}\n`;
						for (let k = 1; k < liLines.length; k++) {
							elementContent += `${listIndentPrefix}  ${liLines[k]}\n`;
						}
					}
					if (elementContent.length > 0 && !elementContent.endsWith("\n")) {
						elementContent += "\n";
					}
					break;
				}
				case "ol": {
					let itemNumber = 1;
					const items = toNodeArray(children);

					for (const itemNode of items) {
						if (!isValidElement(itemNode) || itemNode.type !== "li") {
							continue;
						}
						const liContent = processChildrenToString(getProp(itemNode, "children"), listIndentPrefix + "  ");
						const liLines = liContent.trim().split("\n");

						elementContent += `${listIndentPrefix}${itemNumber}. ${liLines[0] || ""}\n`;
						for (let k = 1; k < liLines.length; k++) {
							elementContent += `${listIndentPrefix} ${liLines[k]}\n`;
						}
						itemNumber++;
					}
					if (elementContent.length > 0 && !elementContent.endsWith("\n")) {
						elementContent += "\n";
					}
					break;
				}
				case "li": {
					elementContent = processChildrenToString(children, listIndentPrefix);
					break;
				}
				case "code": {
					elementContent = `\`${processChildrenToString(children, listIndentPrefix)}\``;
					break;
				}
				case "pre": {
					const lang = String(getProp(element, "language") || "");
					const code = typeof children === "string" ? children : processChildrenToString(children, "");

					elementContent = "```" + lang + "\n" + code.trim() + "\n```\n";
					break;
				}
				case "br": {
					elementContent = "\n";
					break;
				}
				case "p": {
					elementContent = `${processChildrenToString(children, "")}\n`;
					break;
				}
				default: {
					elementContent = processChildrenToString(children, listIndentPrefix);
				}
			}
		} else {
			elementContent = processChildrenToString(children, listIndentPrefix);
		}
		resultString += elementContent;
		previousNodeWasBlock =
			isCurrentNodeHtmlBlock || (elementContent.endsWith("\n") && elementContent.trim().length > 0);
	}

	return resultString;
};
