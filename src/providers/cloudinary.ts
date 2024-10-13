import {
	OperationExtractor,
	Operations,
	URLGenerator,
	URLTransformer,
} from "../types.ts";
import { ImageFormat } from "../types.ts";
import {
	createFormatter,
	createOperationsHandlers,
	createParser,
} from "../utils.ts";

const publicRegex =
	/https?:\/\/(?<host>res\.cloudinary\.com)\/(?<cloudName>[a-zA-Z0-9-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
const privateRegex =
	/https?:\/\/(?<host>(?<cloudName>[a-zA-Z0-9-]+)-res\.cloudinary\.com|[a-zA-Z0-9.-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
type CloudinaryFormats =
	| ImageFormat
	| "gif"
	| "bmp"
	| "ico"
	| "tiff"
	| "pdf"
	| "heif"
	| "heic"
	| "mp4"
	| "webm"
	| "ogv"
	| "auto"
	// deno-lint-ignore ban-types
	| (string & {});

/**
 * Image transform options for Cloudinary URL-based image processing.
 */
export interface CloudinaryOperations extends Operations<CloudinaryFormats> {
	/** Rotates the image by a specified degree. */
	a?: "auto" | number;

	/** Specifies the audio codec for video/audio assets. */
	ac?: "aac" | "mp3" | "opus";

	/** Sets the audio frequency in Hz. */
	af?: number;

	/** Adjusts the aspect ratio of the image or video. */
	ar?: string;

	/** Sets the background color. */
	b?: string;

	/** Adds a border to the image with the format `width_px_solid_color`. */
	bo?: string;

	/** Specifies the video bitrate. */
	br?: number | string;

	/** Defines the crop mode. */
	c?:
		| "fill"
		| "lfill"
		| "fill_pad"
		| "crop"
		| "thumb"
		| "auto"
		| "scale"
		| "fit"
		| "limit"
		| "mfit"
		| "pad"
		| "lpad"
		| "mpad"
		| "imagga_scale"
		| "imagga_crop";

	/** Specifies the color for overlays, text, etc. */
	co?: string;

	/** Adjusts the color space of the image (e.g., `srgb`, `cmyk`). */
	cs?: "srgb" | "cmyk" | "no_cmyk";

	/** Specifies the default image if the original is missing. */
	d?: string;

	/** Sets the delay between frames in animated images. */
	dl?: number;

	/** Controls the image density (DPI). */
	dn?: number;

	/** Adjusts for device pixel ratio. */
	dpr?: number;

	/** Defines the video duration in seconds. */
	du?: number;

	/** Applies an effect. */
	e?:
		| "grayscale"
		| "sepia"
		| "blur"
		| "shadow"
		| "red"
		| "blue"
		| "green"
		| "negate"
		| "oil_paint"
		| "cartoonify"
		| "vectorize"
		| "vignette"
		| "auto_color"
		| "auto_contrast"
		| "auto_brightness"
		| "hue"
		| "saturation"
		| "desaturation"
		| "fade"
		| "pixelate"
		| "unsharp_mask"
		// deno-lint-ignore ban-types
		| (string & {});

	/** Sets the end offset for videos. */
	eo?: number;

	/** Specifies the output format. */
	f?: CloudinaryFormats;

	/** Adds transformation flags. */
	fl?:
		| "progressive"
		| "lossy"
		| "attachment"
		| "streaming_attachment"
		| "keep_iptc"
		| "clip"
		| "region_relative"
		| "relative"
		| "no_overflow"
		| "layer_apply"
		| "splice"
		| "force_strip"
		// deno-lint-ignore ban-types
		| (string & {});
	/** Adds custom functionality, such as external image overlays. */
	fn?: string;

	/** Sets the frames per second for video. */
	fps?: string | number;

	/** Adjusts the gravity for cropping  */
	g?:
		| "auto"
		| "center"
		| "north"
		| "south"
		| "east"
		| "west"
		| "north_east"
		| "north_west"
		| "south_east"
		| "south_west"
		| "face"
		| "faces"
		| "body"
		| "liquid"
		// deno-lint-ignore ban-types
		| (string & {});

	/** Defines the height of the image/video. */
	h?: number;

	/** Allows for conditional transformations. */
	if?: string;

	/** Sets the keyframe interval for videos. */
	ki?: number;

	/** Adds an overlay image or text layer. */
	l?: string;

	/** Controls the opacity of overlays. */
	o?: number;

	/** Prefixes the public ID of the asset. */
	p?: string;

	/** Selects a specific page/layer in multi-page assets (e.g., PDFs). */
	pg?: number;

	/** Sets the quality level of the asset (1-100 or `auto`). */
	q?: number | "auto";

	/** Rounds the corners of the image/video. */
	r?: number | "max";

	/** Sets the start offset for video. */
	so?: number;

	/** Specifies the streaming profile for video. */
	sp?: string;

	/** Applies named transformations. */
	t?: string;

	/** Adds an underlay image or text layer. */
	u?: string;

	/** Specifies the video codec. */
	vc?: string;

	/** Controls video frame sampling (used for animated images). */
	vs?: number;

	/** Sets the width of the image/video. */
	w?: number;

	/** Sets the X-coordinate for overlays or cropping. */
	x?: number;

	/** Sets the Y-coordinate for overlays or cropping. */
	y?: number;

	/** Zooms into the image. */
	z?: number;

	/** Defines custom variables for transformation. */
	$?: Record<string, any>;
}

export interface CloudinaryOptions {
	cloudName?: string;
	privateCdn?: boolean;
	domain?: string;
}

const { operationsGenerator, operationsParser } = createOperationsHandlers<
	CloudinaryOperations
>({
	keyMap: {
		width: "w",
		height: "h",
		format: "f",
		quality: "q",
	},
	defaults: {
		format: "auto",
		c: "lfill",
	},
	formatter: createFormatter(",", "_"),
	parser: createParser(",", "_"),
});

export const generate: URLGenerator<CloudinaryOperations, CloudinaryOptions> = (
	src,
	operations,
) => {
	const group = parseCloudinaryUrl(src.toString());
	if (!group) {
		return src.toString();
	}
	group.transformations = operationsGenerator(operations);
	console.log(group);
	return formatCloudinaryUrl(group);
};

interface CloudinaryParts {
	host?: string;
	cloudName?: string;
	assetType?: string;
	deliveryType?: string;
	signature?: string;
	transformations?: string;
	version?: string;
	id?: string;
}

function formatCloudinaryUrl({
	host,
	cloudName,
	assetType,
	deliveryType,
	signature,
	transformations,
	version,
	id,
}: CloudinaryParts) {
	const isPublic = host === "res.cloudinary.com";
	return [
		"https:/",
		host,
		isPublic ? cloudName : undefined,
		assetType,
		deliveryType,
		signature,
		transformations,
		version,
		id,
	].filter(Boolean).join("/");
}

function parseCloudinaryUrl(url: string): CloudinaryParts | null {
	let matches = url.toString().match(publicRegex);
	if (!matches?.length) {
		matches = url.toString().match(privateRegex);
	}
	if (!matches?.length) {
		return null;
	}
	return matches.groups || {};
}

export const extract: OperationExtractor<
	CloudinaryOperations,
	CloudinaryOptions
> = (url) => {
	const group = parseCloudinaryUrl(url.toString());
	if (!group) {
		return null;
	}
	const {
		transformations: transformString = "",
		...params
	} = group;

	const src = formatCloudinaryUrl(params);

	const operations = operationsParser(transformString) || {};
	return {
		src,
		operations,
		options: {
			cloudName: params.cloudName,
			domain: params.host,
			privateCdn: params.host !== "res.cloudinary.com",
		} as CloudinaryOptions,
	};
};

export const transform: URLTransformer<
	CloudinaryOperations
> = (
	src,
	operations,
) => {
	const group = parseCloudinaryUrl(src.toString());
	if (!group) {
		return src.toString();
	}
	const existing = operationsParser(group.transformations || "");
	group.transformations = operationsGenerator({
		...existing,
		...operations,
	});
	return formatCloudinaryUrl(group);
};
