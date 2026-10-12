import { type TextDisplayProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APITextDisplayComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const TextDisplayNode: NodeProcessor<APITextDisplayComponent, TextDisplayProps> = {
	process: (element, _, processChildrenToString) => {
		const textDisplayProps = element.props;

		return {
			type: ComponentType.TextDisplay,
			id: textDisplayProps.id,
			content: processChildrenToString(textDisplayProps.children),
		};
	},
};
