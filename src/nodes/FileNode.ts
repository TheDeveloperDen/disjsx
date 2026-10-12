import { type FileProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import type { APIFileComponent } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const FileNode: NodeProcessor<APIFileComponent, FileProps> = {
	process: (element) => {
		const fileProps = element.props;

		return {
			type: ComponentType.File,
			id: fileProps.id,
			file: { url: fileProps.url },
			spoiler: fileProps.spoiler,
		};
	},
};
