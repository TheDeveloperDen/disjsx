import { type ThumbnailProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIThumbnailComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const ThumbnailNode: NodeProcessor<APIThumbnailComponent, ThumbnailProps> = {
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
