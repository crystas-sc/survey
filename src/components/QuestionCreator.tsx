import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Button from '@mui/material/Button';
import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import RichTextWidget from './RichTextWidget';

const uiSchema: UiSchema = {
    question: {
        "ui:widget": "rte"
    }
};

const schema: RJSFSchema = {
    title: "",
    type: "object",
    required: ["tags", "component", "question"],
    properties: {
        tags: {
            type: "array", title: "Enter selection tags for the question",
            items: {
                type: "object",
                title: "",

                properties: {
                    key: {
                        type: "string",
                        title: "Enter key"
                    },
                    value: {
                        type: "string",
                        title: "Enter value"
                    }


                },
                required: ["key", "value"],
                minItems: 1
            }
        },
        question: {
            type: "string"
        },
        component: {
            type: "string", title: "Select the Answer component", default: "Text",
            enum: ["Text", "Single-choice", "Single-choice-with-other", "Multi-choice", "Multi-choice-with-other"]
        },

    },
    dependencies: {
        "component": {
            oneOf: [
                {
                    properties: {
                        component: {
                            enum: [
                                "Single-choice", "Single-choice-with-other", "Multi-choice", "Multi-choice-with-other"
                            ]
                        },
                        options: {
                            type: "array",
                            title: "Enter options",
                            items: {
                                type: "object",
                                title: "",
                                properties: {
                                    option: {
                                        type: "string",
                                        title: "",
                                    }

                                },
                                required: ["option"]

                            },
                            minItems: 2

                        }
                    }
                }
            ]
        }
    }

};

export default function QuestionCreator() {
    const [formData, setFormData] = React.useState({ tags: [{ key: "title", value: "" }], question: "Question content", component: "Text" })

    return (
        <>
            <Typography variant="h4" gutterBottom > Create Question </Typography>
            <Divider />
            <Box sx={{ mt: 1 }} >

                <Typography variant='h5'> </Typography>
                <Form
                    formData={formData}
                    schema={schema}
                    validator={validator}
                    uiSchema={uiSchema}
                    widgets={{ rte: RichTextWidget }}
                    onSubmit={(form) => { console.log("formData", form.formData) }}
                >
                    <>
                        <Button type="submit" >Save question</Button>
                    </>
                </Form>
            </Box>


        </>
    );
}