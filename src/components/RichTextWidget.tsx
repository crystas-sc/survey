import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { WidgetProps } from '@rjsf/utils';

export default function RichTextWidget(props: WidgetProps) {
    const editorRef = useRef(null);
    const log = () => {
        if (editorRef.current) {
            console.log((editorRef.current as any).getContent());
        }
    };
    return <>
        <Editor
            tinymceScriptSrc={import.meta.env.VITE_PUBLIC_URL + '/tinymce/tinymce.min.js'}
            onInit={(evt, editor: any) => editorRef.current = editor}
            onChange={()=>{log(); props.onChange((editorRef.current as any).getContent())}}
            initialValue={props.value}
            init={{
                height: 300,
                paste_data_images: true,
                // menubar: false,
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help | image',
                menu: {
                    favs: { title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons' }
                },
                menubar: 'favs file edit view insert format tools table help',
                promotion: false,
                branding: false,
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
        />
    </>
}