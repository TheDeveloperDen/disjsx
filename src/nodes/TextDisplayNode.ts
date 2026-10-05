import { type TextDisplayProps, type TextDisplayPayload, ComponentType } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const TextDisplayNode: NodeProcessor<TextDisplayPayload, TextDisplayProps> = {
	process: (element, _, processChildrenToString) => {
		const textDisplayProps = element.props;

		return {
			type: ComponentType.TextDisplay,
			id: textDisplayProps.id,
			content: processChildrenToString(textDisplayProps.children),
		};
	},
};
