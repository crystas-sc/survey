import React, { useRef } from 'react';
import { WidgetProps,FieldProps } from '@rjsf/utils';
import { createMarkup } from '../utils/general';

export default function HTMLViewerWidget(props: FieldProps) {
    return <div dangerouslySetInnerHTML={createMarkup(props.schema.title || "")} />
}



