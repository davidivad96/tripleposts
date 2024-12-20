import { JSONContent } from "@tiptap/react";
import { CHARACTERS, NEW_LINE } from "./constants";

export const formatText = (json: JSONContent) => {
  if (json.type === "text") {
    const isBold = !!json.marks?.find((mark) => mark.type === "bold");
    const isItalic = !!json.marks?.find((mark) => mark.type === "italic");
    return isBold || isItalic
      ? json.text
          ?.split("")
          .map((char) => getCharacterVariant(char, isBold, isItalic))
          .join("")
      : json.text;
  }
  return "";
};

export const jsonToText = (json: JSONContent) => {
  const paragraphs = json.content ?? [];
  return paragraphs
    .map((paragraph) => {
      if (paragraph.type !== "paragraph") return "";
      if (!paragraph.content) return NEW_LINE;
      const textNodes = paragraph.content;
      return textNodes
        .map((node) => (node.type === "text" ? formatText(node) : ""))
        .join("");
    })
    .join("");
};

export const isVideoFile = (file?: File) => file?.type.startsWith("video/");

// Helper function to get the correct character variant
export const getCharacterVariant = (
  char: string,
  isBold: boolean,
  isItalic: boolean
): string => {
  if (!CHARACTERS[char as keyof typeof CHARACTERS]) return char;
  if (isBold && isItalic)
    return CHARACTERS[char as keyof typeof CHARACTERS].bold_and_italic;
  if (isBold) return CHARACTERS[char as keyof typeof CHARACTERS].bold;
  if (isItalic) return CHARACTERS[char as keyof typeof CHARACTERS].italic;
  return char;
};
