import { Children } from "react";
import { type SectionProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APISectionAccessoryComponent, APISectionComponent, APITextDisplayComponent } from "discord-api-types/v10";
import { flattenProcessed, type NodeProcessor } from "./types.js";

export const SectionNode: NodeProcessor<
	APISectionComponent,
	SectionProps,
	APITextDisplayComponent | APISectionAccessoryComponent
> = {
	process: (element, processChildNode) => {
		const sectionProps = element.props;
		const sectionChildren = Children.toArray(sectionProps.children);
		const textDisplays: APITextDisplayComponent[] = [];
		let accessory: APISectionAccessoryComponent | undefined = undefined;

		for (const child of sectionChildren) {
			for (const processedChild of flattenProcessed(processChildNode(child))) {
				if (processedChild.type === ComponentType.TextDisplay) {
					textDisplays.push(processedChild);
				} else if (processedChild.type === ComponentType.Thumbnail || processedChild.type === ComponentType.Button) {
					accessory = processedChild;
				}
			}
		}

		// A section is invalid without an accessory (validation reports it), so there is nothing to render.
		if (!accessory) {
			return null;
		}

		return {
			type: ComponentType.Section,
			id: sectionProps.id,
			components: textDisplays,
			accessory,
		};
	},
};
