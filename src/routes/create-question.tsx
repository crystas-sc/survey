import QuestionCreator from "../components/QuestionCreator";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { ArrayFieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import Button from '@mui/material/Button';
import RichTextWidget from "../components/RichTextWidget";
import { Accordion, Box, Icon, IconButton } from "@mui/material";
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import { transformSurveyToJsonSchema } from "../utils/transform-util"
import { decryptMessage, encryptMessage } from "../utils/aes-encryption"

const uiSchema: UiSchema = {
    sections: {
        "ui:accordian": true,
        items: {
            questions: {
                "ui:accordian": true,
                items: {
                    question: {
                        "ui:widget": "rte",
                    }
                }

            }
        }
    }

};
const schema: RJSFSchema =
{
    title: "Create Survey",
    type: "object",
    properties: {
        title: {
            type: "string",
            title: "Title"
        },
        sections: {
            title: "Sections",
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                title: "",
                properties: {
                    name: {
                        type: "string",
                        title: "Section Name",

                    },



                    questions: {
                        type: "array",
                        title: "Questions",
                        minItems: 1,
                        items: {
                            type: "object",
                            title: "",
                            properties: {

                                question: {
                                    type: "string",
                                    default: "Enter Question"
                                },
                                component: {
                                    type: "string", title: "Select the Answer component", default: "Text",
                                    enum: ["Text", "Single-choice", "Multi-choice", "Multi-choice-with-other"]
                                },


                            },
                            dependencies: {
                                "component": {
                                    oneOf: [
                                        {
                                            properties: {
                                                component: {
                                                    enum: [
                                                        "Text"
                                                    ]
                                                },
                                            }
                                        },
                                        {
                                            properties: {
                                                component: {
                                                    enum: [
                                                        "Single-choice", "Multi-choice", "Multi-choice-with-other"
                                                    ]
                                                },
                                                options: {
                                                    type: "array",
                                                    title: "Enter options",
                                                    items: {
                                                        type: "string",
                                                        title: ""

                                                    },
                                                    minItems: 2

                                                }
                                            }
                                        }
                                    ]
                                }
                            }

                        }
                    }


                }

            },


        }

    }
}
    ;

export default function CreateQuestion() {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(JSON.parse(window.localStorage.getItem("savedSurvey") || "{}"))
    }, [])
    return <>
        <Form
            formData={formData}
            schema={schema}
            validator={validator}
            uiSchema={uiSchema}
            widgets={{ rte: RichTextWidget }}
            templates={{ ArrayFieldTemplate }}
            onSubmit={async (form) => {
                console.log("formData", form.formData);
                window.localStorage.setItem("savedSurvey", JSON.stringify(form.formData))
                console.log("submit", JSON.stringify(transformSurveyToJsonSchema(form.formData)))
                let encryptedMessage = await encryptMessage(form.formData)
                console.log("encryptedMessage",encryptedMessage)
                console.log("decryptedMessage",await decryptMessage(encryptedMessage))

            }}
        >
            <>
                <Button type="submit" >Save survey</Button>
            </>
        </Form>
    </>
}


function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {


    return <Box sx={{ p: 1 }}>
        {props.uiSchema!["ui:accordian"] && props.items.map((element, index) => {
            console.log("ArrayFieldTemplateProps element", element); return (<Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Typography>{props.title} {index + 1}</Typography>

                        <Box>
                            {element.hasMoveUp && <IconButton onClick={(e) => { e.stopPropagation(); element.onReorderClick(index, index - 1)() }}>↑</IconButton>}
                            {element.hasMoveDown && <IconButton onClick={(e) => { e.stopPropagation(); element.onReorderClick(index, index + 1)() }}>↓</IconButton>}
                            {element.hasRemove && <IconButton onClick={(e) => { e.stopPropagation(); element.onDropIndexClick(index)() }}>X</IconButton>}

                        </Box>
                    </Box>

                </AccordionSummary>
                <AccordionDetails>
                    {element.children}
                </AccordionDetails>
            </Accordion>
            )
        })
        }

        {!props.uiSchema!["ui:accordian"] && props.items.map((element, index) => {
            console.log("ArrayFieldTemplateProps element", element); return (
                <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Box sx={{ flexGrow: 1, p: 0 }}>
                            {element.children}
                        </Box>

                        <Box>
                            {element.hasMoveUp && <IconButton onClick={(e) => { e.stopPropagation(); element.onReorderClick(index, index - 1)() }}>↑</IconButton>}
                            {element.hasMoveDown && <IconButton onClick={(e) => { e.stopPropagation(); element.onReorderClick(index, index + 1)() }}>↓</IconButton>}
                            {element.hasRemove && <IconButton onClick={(e) => { e.stopPropagation(); element.onDropIndexClick(index)() }}>X</IconButton>}

                        </Box>
                    </Box>


                </>
            )
        })
        }

        {props.canAdd && <Button type="button" onClick={props.onAddClick}>+ Add {props.title}</Button>}

    </Box>
}



