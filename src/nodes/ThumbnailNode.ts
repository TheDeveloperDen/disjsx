import { type ThumbnailProps, type ThumbnailPayload, ComponentType } from "../types.js";
import { type NodeProcessor } from "./types.js";

export const ThumbnailNode: NodeProcessor<ThumbnailPayload, ThumbnailProps> = {
	process: (element) => {
		const thumbProps = element.props;

		return {
			type: ComponentType.Thumbnail,
			id: thumbProps.id,
			media: {
				url: thumbProps.url,
			},
			description: thumbProps.description,
			spoiler: thumbProps.spoiler,
		};
	},
};
