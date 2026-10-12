import { Children, isValidElement } from "react";
import { type MediaGalleryProps } from "../types.js";
import { ComponentType } from "discord-api-types/v10";
import { DISJSX, isDISJSXElement } from "../disjsxTypes.js";
import type { APIMediaGalleryComponent, APIMediaGalleryItem } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const MediaGalleryNode: NodeProcessor<APIMediaGalleryComponent, MediaGalleryProps> = {
	process: (element, _, __, ___, getProcessedElement) => {
		const galleryProps = element.props;
		const items: APIMediaGalleryItem[] = [];

		for (const rawChildNode of Children.toArray(galleryProps.children)) {
			if (!isValidElement(rawChildNode)) {
				continue;
			}
			const childNode = getProcessedElement(rawChildNode);

			if (!isDISJSXElement(childNode, DISJSX.MediaGalleryItem)) {
				continue;
			}
			const itemProps = childNode.props;

			items.push({
				media: {
					url: itemProps.url,
				},
				description: itemProps.description,
				spoiler: itemProps.spoiler,
			});
		}

		return {
			type: ComponentType.MediaGallery,
			id: galleryProps.id,
			items,
		};
	},
};
