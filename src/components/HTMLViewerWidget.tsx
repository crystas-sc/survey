import React, { useRef } from 'react';
import { WidgetProps,FieldProps } from '@rjsf/utils';

export default function HTMLViewerWidget(props: FieldProps) {
    return <div dangerouslySetInnerHTML={createMarkup(props.schema.title || "")} />
}

function createMarkup(htmlStr: string) {
    return { __html: htmlStr };
}

