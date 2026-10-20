import { useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Bold, Italic, Link2, List, ListOrdered, Unlink } from "lucide-react";
import { aHtml } from "../../utilidades/textoRico";

type Propiedades = {
  //el texto con el que arranca (HTML o texto plano de antes); después el editor manda
  valorInicial: string;
  alCambiar: (html: string) => void;
  //id de la etiqueta visible: el área se anuncia con ese nombre
  idEtiqueta: string;
  idDescripcion?: string;
  placeholder?: string;
  conError?: boolean;
  alto?: "normal" | "alto";
};

//caja de texto con formato: negrita, cursiva, listas y enlaces; nada más, para que se lea igual en el correo y en la web
export default function EditorTexto({ valorInicial, alCambiar, idEtiqueta, idDescripcion, placeholder, conError = false, alto = "normal" }: Propiedades) {
  const [pidiendoEnlace, setPidiendoEnlace] = useState(false);
  const [enlace, setEnlace] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        //sin el párrafo vacío que se agrega solo después de una lista
        trailingNode: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", protocols: ["http", "https", "mailto"] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: aHtml(valorInicial),
    //vacío se informa como "" para que las validaciones de "obligatorio" funcionen
    onUpdate: ({ editor }) => alCambiar(editor.isEmpty ? "" : editor.getHTML()),
    editorProps: {
      attributes: {
        class: "editor__area",
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": idEtiqueta,
        ...(idDescripcion ? { "aria-describedby": idDescripcion } : {}),
      },
    },
  });

  //los botones se marcan cuando el formato está activo donde está el cursor
  const activo = useEditorState({
    editor,
    selector: ({ editor }) => ({
      negrita: editor?.isActive("bold") ?? false,
      cursiva: editor?.isActive("italic") ?? false,
      vinetas: editor?.isActive("bulletList") ?? false,
      numerada: editor?.isActive("orderedList") ?? false,
      enlace: editor?.isActive("link") ?? false,
    }),
  });

  function abrirEnlace() {
    if (!editor) return;
    setEnlace(editor.getAttributes("link").href ?? "");
    setPidiendoEnlace(true);
  }

  function aplicarEnlace() {
    if (!editor) return;
    const direccion = enlace.trim();
    if (!direccion) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^(https?:|mailto:)/i.test(direccion) ? direccion : `https://${direccion}`;
      //sin texto elegido, el enlace se escribe con su propia dirección
      if (editor.state.selection.empty && !editor.isActive("link")) {
        editor.chain().focus().insertContent({ type: "text", text: direccion, marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
      }
    }
    setPidiendoEnlace(false);
  }

  const botones = [
    { nombre: "Negrita (Ctrl+B)", Icono: Bold, activo: activo?.negrita, accion: () => editor?.chain().focus().toggleBold().run() },
    { nombre: "Cursiva (Ctrl+I)", Icono: Italic, activo: activo?.cursiva, accion: () => editor?.chain().focus().toggleItalic().run() },
    { nombre: "Lista con viñetas", Icono: List, activo: activo?.vinetas, accion: () => editor?.chain().focus().toggleBulletList().run() },
    { nombre: "Lista numerada", Icono: ListOrdered, activo: activo?.numerada, accion: () => editor?.chain().focus().toggleOrderedList().run() },
  ];

  return (
    <div className={`editor ${conError ? "editor--error" : ""} ${alto === "alto" ? "editor--alto" : ""}`}>
      <div className="editor__barra" role="toolbar" aria-label="Formato del texto">
        {botones.map(({ nombre, Icono, activo: encendido, accion }) => (
          <button className="editor__boton" type="button" title={nombre} aria-label={nombre} aria-pressed={Boolean(encendido)} onClick={accion} key={nombre}>
            <Icono size={16} aria-hidden="true" />
          </button>
        ))}
        <span className="editor__separador" aria-hidden="true" />
        <button className="editor__boton" type="button" title="Enlace" aria-label="Enlace" aria-pressed={Boolean(activo?.enlace)} aria-expanded={pidiendoEnlace} onClick={abrirEnlace}>
          <Link2 size={16} aria-hidden="true" />
        </button>
        {activo?.enlace && (
          <button className="editor__boton" type="button" title="Quitar enlace" aria-label="Quitar enlace" onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}>
            <Unlink size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {pidiendoEnlace && (
        //div y no form: el editor puede estar dentro de otro formulario
        <div className="editor__enlace">
          <input
            type="text"
            inputMode="url"
            aria-label="Dirección del enlace"
            placeholder="https://…"
            value={enlace}
            onChange={(evento) => setEnlace(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === "Escape") setPidiendoEnlace(false);
              if (evento.key === "Enter") {
                evento.preventDefault();
                aplicarEnlace();
              }
            }}
            autoFocus
          />
          <button className="boton boton--fantasma boton--chico" type="button" onClick={() => setPidiendoEnlace(false)}>
            Cancelar
          </button>
          <button className="boton boton--primario boton--chico" type="button" onClick={aplicarEnlace}>
            Aplicar
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
