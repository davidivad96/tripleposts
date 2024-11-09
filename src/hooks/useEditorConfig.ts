import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorOptions } from "@tiptap/react";

const CustomHardBreak = HardBreak.extend({
  addKeyboardShortcuts: () => ({
    "Mod-Enter": () => {
      const postButton = document.querySelector("button[data-post-button]");
      if (postButton instanceof HTMLButtonElement && !postButton.disabled) {
        postButton.click();
      }
      return true;
    },
  }),
});

export const useEditorConfig = (): Partial<EditorOptions> => ({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    CustomHardBreak,
    Placeholder.configure({
      placeholder: "What's happening?!",
      emptyNodeClass:
        "first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0 first:before:opacity-50",
    }),
  ],
  content: "",
  editorProps: {
    attributes: {
      class:
        "prose dark:prose-invert outline-none focus:ring-0 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 min-h-[90px] max-h-[200px] overflow-y-scroll focus-within:border focus-within:border-blue-500 dark:focus-within:border-blue-500",
    },
  },
});
