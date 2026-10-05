import { type SeparatorProps, type SeparatorPayload, ComponentType } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const SeparatorNode: NodeProcessor<SeparatorPayload, SeparatorProps> = {
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
