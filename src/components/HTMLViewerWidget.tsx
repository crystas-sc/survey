import React, { useRef } from 'react';
import { WidgetProps,FieldProps } from '@rjsf/utils';
import { createMarkup } from '../utils/general';
import { Typography } from '@mui/material';

export default function HTMLViewerWidget(props: FieldProps) {
    return <Typography> <div dangerouslySetInnerHTML={createMarkup(props.schema.title || "")} /> </Typography>
}



