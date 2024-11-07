import { JSONContent } from "@tiptap/react";
import { getCharacterVariant, NEW_LINE } from "./constants";

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
