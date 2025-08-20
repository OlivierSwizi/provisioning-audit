import { Col, Row } from "antd";
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const HTMLEditor = ({ value, onChange, onBlur = () => {} }) => {
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    previewRef.current.contentWindow.document.body.innerHTML = value;
  });

  const previewRef = useRef();
  const editorRef = useRef();

  useEffect(() => {
    if (editorRef.current)
      editorRef.current.onDidBlurEditorWidget(() => {
        onBlur();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorLoaded]);

  const onEditorChange = (value) => {
    previewRef.current.contentWindow.document.body.innerHTML = value;
    onChange(value);
  };
  return (
    <Row style={{ width: "100%", height: "500px" }}>
      <Col span={12}>
        <Editor
          language="html"
          options={{ automaticLayout: true, minimap: { enabled: false } }}
          value={value}
          onChange={onEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;
            setEditorLoaded(true);
          }}
        />
      </Col>
      <Col span={12}>
        <iframe
          id="editorPreview"
          ref={previewRef}
          frameBorder="0"
          title="preview"
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      </Col>
    </Row>
  );
};

export default HTMLEditor;
