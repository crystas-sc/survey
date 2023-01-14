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
import {
    decryptMessage, encryptMessage,
    exportKey, importKey, getNewKey
} from "../utils/aes-encryption"
import {
    decryptMessage as rsaDecryptMessage, encryptMessage as rsaEncryptMessage,
    getNewKey as getNewRsaKey,
    exportPubKey, exportPvtKey, importPubKey, importPvtKey
} from "../utils/ppk-encryption"
import { downloadFile } from "../utils/general";

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
    },
    pubKey: {
        "ui:widget": "textarea"
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


        },
        pubKey: {
            type: "string",
            title: "JWK Public key"
        },
        pvtKeyHint: {
            type: "string",
            title: "Hint to remember the entered assoicated Private key"
        },


    },
    required: ["title", "pubKey", "pvtKeyHint"]
}
    ;

export default function CreateQuestion() {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(JSON.parse(window.localStorage.getItem("savedSurvey") || "{}"))
    }, [])

    const handleSubmit = async (data: any) => {
        // TODO document why this async arrow function is empty
        const aesKeyStr = await exportKey(await getNewKey())

        const ppk = await getNewRsaKey()
        const pubKeyStr = await exportPubKey(ppk.publicKey)
        const pvtKeyStr = await exportPvtKey(ppk.privateKey)



        console.log("pubKeyStr", pubKeyStr)
        console.log("pvtKeyStr", pvtKeyStr)
        console.log("aesKeyStr", aesKeyStr)



        const pubKey = await importPubKey(pubKeyStr)
        const pvtKey = await importPvtKey(pvtKeyStr)
        console.log("pubKey", pubKey)
        console.log("pvtKey", pvtKey)

        const encAesKey = await rsaEncryptMessage(pubKey, aesKeyStr)
        console.log("encAesKey", encAesKey)
        const decAesKey = await rsaDecryptMessage(pvtKey, encAesKey)
        console.log("decAesKey", decAesKey)




        const aesKey = await importKey(decAesKey)

        console.log("aesKey", aesKey)
        let encData = await encryptMessage(aesKey, JSON.stringify(data))
        console.log("encData", encData)
        let decData = await decryptMessage(aesKey, encData)
        console.log("decData", decData)




    }

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
                handleSubmit(form.formData)
                console.log("submit", JSON.stringify(transformSurveyToJsonSchema(form.formData)))
                const res: any = transformSurveyToJsonSchema(form.formData);
                res["pubKey"] = form.formData.pubKey
                res["pvtKeyHint"] = form.formData.pvtKeyHint
                downloadFile(form.formData.title + ".json", JSON.stringify(res))
                // let encryptedMessage = await encryptMessage(form.formData)
                // console.log("encryptedMessage",encryptedMessage)
                // console.log("decryptedMessage",await decryptMessage(encryptedMessage))



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



