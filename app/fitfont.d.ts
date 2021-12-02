// Type definitions for fitfont 1.3
// Project: https://github.com/gregoiresage/fitfont
// Definitions by: Jérémy Jeanson <https://github.com/JeremyJeanson>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// I just threw the style in there

declare module "fitfont" {
	/**
	 * Horizontal alignment
	 */
	export type HorizontalAlign = "start" | "middle" | "end";

	/**
	 * Vertical alignment
	 */
	export type VerticalAlign = "top" | "middle" | "bottom" | "baseline";

	/**
	 * Option to initialize a fitfont class
	 */
	export interface Options {
		/**
		 * Id of the symbol or the Element to use
		 */
		id: string | object;
		/**
		 * name of the generated font folder
		 */
		font: string;
		/**
		 * Horizontal alignment
		 */
		halign?: HorizontalAlign | undefined;
		/**
		 * Vertical alignment
		 */
		valign?: VerticalAlign | undefined;
		/**
		 * Letter spacing
		 */
		letterspacing?: number | undefined;
	}

	/**
	 * Fitfont class to use cutom fonts
	 */
	export class FitFont {
		constructor(options: Options);

		style: Style;

		/**
		 * Force the redraw
		 */
		redraw(): void;

		/**
		 * Text to show
		 */
		text: string;

		/**
		 * Horizontal alignment
		 */
		halign: HorizontalAlign;

		/**
		 * Vertical alignment
		 */
		valign: VerticalAlign;

		/**
		 * Letter spacing
		 */
		letterspacing: number;

		/**
		 * With (read only)
		 */
		readonly width: number;
	}
}
