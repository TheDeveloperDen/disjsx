import { type SeparatorProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APISeparatorComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const SeparatorNode: NodeProcessor<APISeparatorComponent, SeparatorProps> = {
	process: (element) => {
		const sepProps = element.props;

		return {
			type: ComponentType.Separator,
			id: sepProps.id,
			divider: sepProps.divider === undefined ? true : sepProps.divider,
			spacing: sepProps.spacing === undefined ? 1 : sepProps.spacing,
		};
	},
};
