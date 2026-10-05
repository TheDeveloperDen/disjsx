import { DISJSX } from "../disjsxTypes.js";
import { ActionRowNode } from "./ActionRowNode.js";
import { ButtonNode } from "./ButtonNode.js";
import { StringSelectNode } from "./StringSelectNode.js";
import { EmbedNode } from "./EmbedNode.js";
import { TextDisplayNode } from "./TextDisplayNode.js";
import { SeparatorNode } from "./SeparatorNode.js";
import { UserSelectNode } from "./UserSelectNode.js";
import { ContainerNode } from "./ContainerNode.js";
import { RoleSelectNode } from "./RoleSelectNode.js";
import { MentionableSelectNode } from "./MentionableSelectNode.js";
import { ChannelSelectNode } from "./ChannelSelectNode.js";
import { TextInputNode } from "./TextInputNode.js";
import { ThumbnailNode } from "./ThumbnailNode.js";
import { FileNode } from "./FileNode.js";
import { SectionNode } from "./SectionNode.js";
import { MediaGalleryNode } from "./MediaGalleryNode.js";
import { LabelNode } from "./LabelNode.js";
import { FileUploadNode } from "./FileUploadNode.js";
import { type NodeProcessor } from "./types.js";
import type { AnyComponentPayload, EmbedPayload } from "../types.js";

/**
 * Registry of node processors for main DISJSX components
 * Child components (like EmbedAuthor, SelectOption) are handled by their parent processors
 * Special components (like Message, Content) are handled in renderDiscordMessage
 */
export const nodeProcessors = {
	[DISJSX.ActionRow]: ActionRowNode,
	[DISJSX.Button]: ButtonNode,
	[DISJSX.StringSelect]: StringSelectNode,
	[DISJSX.Embed]: EmbedNode,
	[DISJSX.TextDisplay]: TextDisplayNode,
	[DISJSX.Separator]: SeparatorNode,
	[DISJSX.UserSelect]: UserSelectNode,
	[DISJSX.Container]: ContainerNode,
	[DISJSX.RoleSelect]: RoleSelectNode,
	[DISJSX.MentionableSelect]: MentionableSelectNode,
	[DISJSX.ChannelSelect]: ChannelSelectNode,
	[DISJSX.TextInput]: TextInputNode,
	[DISJSX.Thumbnail]: ThumbnailNode,
	[DISJSX.Section]: SectionNode,
	[DISJSX.MediaGallery]: MediaGalleryNode,
	[DISJSX.File]: FileNode,
	[DISJSX.Label]: LabelNode,
	[DISJSX.FileUpload]: FileUploadNode,
} satisfies Partial<Record<DISJSX, NodeProcessor<AnyComponentPayload | EmbedPayload, never>>>;

export * from "./types.js";
export * from "./ActionRowNode.js";
export * from "./ButtonNode.js";
export * from "./StringSelectNode.js";
export * from "./EmbedNode.js";
export * from "./TextDisplayNode.js";
export * from "./SeparatorNode.js";
export * from "./UserSelectNode.js";
export * from "./ContainerNode.js";
export * from "./RoleSelectNode.js";
export * from "./MentionableSelectNode.js";
export * from "./ChannelSelectNode.js";
export * from "./TextInputNode.js";
export * from "./ThumbnailNode.js";
export * from "./FileNode.js";
export * from "./SectionNode.js";
export * from "./MediaGalleryNode.js";
export * from "./LabelNode.js";
export * from "./FileUploadNode.js";
