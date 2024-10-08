/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getDocumentById, updateDocument } from "@/api/functions/documents";
import { ToC } from "@/components/ui/EditorElements/Contents";
import DocNavbar from "@/components/ui/EditorElements/Navbar";
import { SlashCommandExtension } from "@/components/ui/EditorExtensions/SlashCommand";
import EditorFn from "@/components/ui/editorWrapper";
import LoadingState from "@/components/ui/loadingState";
import { useToast } from "@/components/ui/use-toast";
import { myExtensions } from "@/lib/editor";
import { generateColorsFromInitial } from "@/lib/utils";
import { useUserStore } from "@/store/user";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Image from "@tiptap/extension-image";
import { Plugin } from "@tiptap/pm/state";
import { useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Y from "yjs";
const yDoc = new Y.Doc();
export default function LiveDocumentEditorScreen() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [docTitle, setTitle] = useState("");
  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ["get", "document", id],
    queryFn: async () => {
      const res = await getDocumentById({ projectId, documentId: id });
      return res?.data;
    },
    staleTime: 0,
    enabled: false,
  });
  const { user } = useUserStore();
  const provider = useCallback(() => {
    return new HocuspocusProvider({
      url: "ws://127.0.0.1:1234/collaboration/",
      name: id,
      document: yDoc,
    });
  }, []);
  const debounceTimeoutRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false); // Tracks if there are unsaved changes

  const {
    mutateAsync,
    isPending,
    isError: isErrorSaving,
  } = useMutation({
    mutationKey: ["update", "document", id],
    mutationFn: async ({
      content,
      title,
    }: {
      content: string;
      title: string;
    }) => {
      const res = await updateDocument({
        projectId,
        documentId: id == "new" ? undefined : id,
        title: title,
        content: content,
      });
      // //console.log(res);
      return res?.documentId;
    },
  });
  useEffect(() => {
    if (id != "new") refetch();
  }, []);
  useEffect(() => {
    if (isError && error)
      //@ts-ignore
      throw new Error(error?.response?.data?.message || error);
  }, [isError, error]);

  const editor = useEditor({
    extensions: [
      ...myExtensions,
      Image.extend({
        addProseMirrorPlugins() {
          const plugin = new Plugin({
            props: {
              handleDOMEvents: {
                paste(view, event) {
                  const url = event.clipboardData.getData("text/plain");
                  const isImage =
                    /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)(\?.*)?$)/i.test(
                      url
                    );

                  if (isImage) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                },
              },
            },
          });
          return [plugin];
        },
      }),
      SlashCommandExtension.configure({
        onSlashEnter: () => {
          const { state } = editor;
          const { $from, to } = state.selection;

          // Get the text before the selection
          const textBefore = state.doc.textBetween(0, $from.pos, "\n", "\n");

          // Get the text after the selection
          const textAfter = state.doc.textBetween(
            to,
            state.doc.content.size,
            "\n",
            "\n"
          );

          // //console.log("Text before selection: ", textBefore);
          // //console.log("Text after selection: ", textAfter);
          // Logic to show your input field
          editor.chain().focus().insertAISuggestion({
            previousContent: textBefore,
            nextContent: textAfter,
            projectId: projectId,
          });
        },
      }),
      Collaboration.configure({
        document: yDoc,
      }),

      CollaborationCursor.configure({
        provider: provider(),
        user: {
          name: user?.username,
          color: generateColorsFromInitial(user?.username).background,
        },
      }),
    ],

    onUpdate: ({ editor }) => {
      // //console.log(editor.getJSON());
      if (editor.getJSON().content?.length == 0) return;
      if (
        !editor.getJSON().content[0].content ||
        editor.getJSON().content[0].content?.length == 0
      )
        return;
      setIsDirty(true);

      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(async () => {
        let title = "";
        try {
          title = editor.getJSON().content[0].content[0].text;
        } catch (e) {
          console.error(e);
        }
        if (title !== "") {
          if (title != docTitle) setTitle(title);
          const docId = await mutateAsync({ content: editor.getHTML(), title });

          if (docId) {
            setIsDirty(false);
            if (id != docId) {
              navigate(`/document/editor/${projectId}/${docId}`, {
                replace: true,
              });
            }
          }
        } else {
          toast({
            title: "Title is required",
            description: "Please add a title to save the document",
          });
        }
      }, 1500);
    },

    // content: mkdown,
  });

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        // Standard message used by most browsers
        const message =
          "You have unsaved changes. Wait for a second to save your changes.";
        event.preventDefault(); // Cancel the event
        event.returnValue = message; // Legacy method for some browsers
        return message; // Modern browsers
      }
    };

    // Attach event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (isErrorSaving) {
      toast({
        title: "Failed to save document",
        description: "There was an error saving the document.",
        variant: "destructive",
      });
    }
  }, [isErrorSaving]);

  useEffect(() => {
    ////console.log(data);
    if (data) {
      editor.commands.setContent(data?.content?.content || "");
      setTitle(data?.content?.title || "");
    }
  }, [data, editor]);

  if (isLoading) {
    return <LoadingState />;
  }
  return (
    <div className=" bg-slate-50">
      <div className=" flex flex-col  md:px-2">
        <div className="p-0 z-[10000]  ">
          <DocNavbar name={docTitle} saving={isPending} editor={editor} />
        </div>

        <div className="flex gap-2 max-w-[1280px]  mx-auto">
          <ToC editor={editor} />
          <EditorFn saving={false} name="Test" editor={editor} />
        </div>
      </div>
    </div>
  );
}
