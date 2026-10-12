import { Children } from "react";
import { type ContainerProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIComponentInContainer, APIContainerComponent } from "discord-api-types/v10";
import { flattenProcessed, type NodeProcessor } from "./types.js";

export const ContainerNode: NodeProcessor<APIContainerComponent, ContainerProps, APIComponentInContainer> = {
	process: (element, processChildNode) => {
		const containerProps = element.props;
		const components: APIComponentInContainer[] = [];

		for (const child of Children.toArray(containerProps.children)) {
			components.push(...flattenProcessed(processChildNode(child)));
		}

		return {
			type: ComponentType.Container,
			id: containerProps.id,
			components,
			accent_color:
				typeof containerProps.accentColor === "string"
					? parseInt(containerProps.accentColor.replace("#", ""), 16)
					: containerProps.accentColor,
			spoiler: containerProps.spoiler,
		};
	},
};
