import { Children, isValidElement } from "react";
import { type LabelProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIComponentInLabel, APILabelComponent } from "discord-api-types/v10";
import { flattenProcessed, type NodeProcessor } from "./types.js";

export const LabelNode: NodeProcessor<APILabelComponent, LabelProps, APIComponentInLabel> = {
	process: (element, processNode) => {
		const labelProps = element.props;
		const children = Children.toArray(labelProps.children);

		// Find the first valid child component
		let component: APIComponentInLabel | null = null;

		for (const child of children) {
			if (isValidElement(child)) {
				const [processed] = flattenProcessed(processNode(child));

				if (processed) {
					component = processed;
					break;
				}
			}
		}

		if (!component) {
			console.warn("Label must contain a child component (TextInput, Select, or FileUpload)");
			return null;
		}

		return {
			type: ComponentType.Label,
			id: labelProps.id,
			label: labelProps.label,
			description: labelProps.description,
			component: component,
		};
	},
};
