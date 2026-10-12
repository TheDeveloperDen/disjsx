import { Children, isValidElement } from "react";
import { type EmbedProps } from "../types.js";
import { DISJSX, resolveElement } from "../disjsxTypes.js";
import type { APIEmbed } from "discord-api-types/v10";
import { type NodeProcessor } from "./types.js";

export const EmbedNode: NodeProcessor<APIEmbed, EmbedProps> = {
	process: (element, _, processChildrenToString, __, getProcessedElement) => {
		const embedProps = element.props;
		const payload: APIEmbed = {
			title: embedProps.title,
			description: embedProps.description,
			url: embedProps.url,
			timestamp: embedProps.timestamp instanceof Date ? embedProps.timestamp.toISOString() : embedProps.timestamp,
			color: typeof embedProps.color === "string" ? parseInt(embedProps.color.replace("#", ""), 16) : embedProps.color,
			fields: [],
		};

		let tempDescription = "";

		for (const rawChild of Children.toArray(embedProps.children)) {
			if (!isValidElement(rawChild)) {
				continue;
			}

			const child = resolveElement(getProcessedElement(rawChild));

			if (!child) {
				continue;
			}

			switch (child.kind) {
				case DISJSX.EmbedAuthor: {
					const authorProps = child.element.props;

					payload.author = {
						name: authorProps.name,
						url: authorProps.url,
						icon_url: authorProps.iconUrl,
					};
					break;
				}

				case DISJSX.EmbedTitle: {
					if (!payload.title) {
						payload.title = processChildrenToString(child.element.props.children);
					}

					break;
				}

				case DISJSX.EmbedDescription: {
					const description = processChildrenToString(child.element.props.children);

					tempDescription += (tempDescription ? "\n" : "") + description;
					break;
				}

				case DISJSX.EmbedFooter: {
					const footerProps = child.element.props;

					payload.footer = {
						text: footerProps.text || processChildrenToString(footerProps.children),
						icon_url: footerProps.iconUrl,
					};
					break;
				}

				case DISJSX.EmbedImage: {
					payload.image = {
						url: child.element.props.url,
					};
					break;
				}

				case DISJSX.EmbedThumbnail: {
					payload.thumbnail = {
						url: child.element.props.url,
					};
					break;
				}

				case DISJSX.EmbedFields: {
					const fieldChildren = Children.toArray(child.element.props.children);

					for (const rawFieldChild of fieldChildren) {
						if (!isValidElement(rawFieldChild)) {
							continue;
						}

						const fieldChild = resolveElement(getProcessedElement(rawFieldChild));

						if (fieldChild?.kind !== DISJSX.EmbedField) {
							continue;
						}

						const fieldProps = fieldChild.element.props;
						let fieldName = fieldProps.title || "";
						let fieldValue = fieldProps.value || "";

						// If name or value not provided as props, look in children
						if (!fieldName || !fieldValue) {
							for (const rawSubChild of Children.toArray(fieldProps.children)) {
								if (!isValidElement(rawSubChild)) {
									continue;
								}

								const subChild = resolveElement(getProcessedElement(rawSubChild));

								if (subChild?.kind === DISJSX.EmbedFieldTitle && !fieldName) {
									fieldName = processChildrenToString(subChild.element.props.children);
								} else if (subChild?.kind === DISJSX.EmbedFieldValue && !fieldValue) {
									fieldValue = processChildrenToString(subChild.element.props.children);
								}
							}
						}

						if (fieldName && fieldValue) {
							payload.fields?.push({
								name: fieldName,
								value: fieldValue,
								inline: fieldProps.inline,
							});
						}
					}
					break;
				}
			}
		}

		if (tempDescription) {
			payload.description = (payload.description ? payload.description + "\n" : "") + tempDescription;
		}

		if (payload.fields?.length === 0) {
			delete payload.fields;
		}

		return payload;
	},
};
