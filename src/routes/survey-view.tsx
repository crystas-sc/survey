import { useEffect, useState } from "react";
import { getUISchemaFromCustomJSONSchema, schemaToTreeView, transformSurveyToJsonSchema } from "../utils/transform-util";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { ArrayFieldTemplateProps, ErrorListProps, ObjectFieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import { Alert, AlertTitle, Box, Button, Divider, getSkeletonUtilityClass, Typography } from "@mui/material";
import HTMLViewerWidget from "../components/HTMLViewerWidget";
import MultiChoiceWithOtherWidget from "../components/MultiChoiceWithOtherWidget";
import { useNavigate, useParams } from 'react-router-dom';
import { encryptMessage, exportKey, getKey, getNewKey } from "../utils/aes-encryption";
import {
    decryptMessage as rsaDecryptMessage, encryptMessage as rsaEncryptMessage,
    getNewKey as getNewRsaKey,
    exportPubKey, exportPvtKey, importPubKey, importPvtKey
} from "../utils/ppk-encryption"
import UploadSurveyQuestionsDialog from "../components/UploadSurveyQuestionsDialog";
import { downloadFile } from "../utils/general";
import QuestionsTree from "../components/QuestionsTree";
const dummyPubKey = { "alg": "RSA-OAEP-256", "e": "AQAB", "ext": true, "key_ops": ["encrypt"], "kty": "RSA", "n": "tmotKzDCo0T0Bu3bIuKmkdqTZ5uRwCzOWBYI1M52oB2PVXYXmpI6N3YZzxOcjdxrdqrpVDyk5W1j_qXYbjFSBpkVGH0EAKbefdsbMFNl4ojosQccp-TkdA1vV0HMBbTL1p8nN-nPcEP_AeHgGwg0QcOmSMazNq5xTwN9nHn9hkYPlGhehljx6IX4JpybozMOktWcfeUzHff_HwvXcEzb7rTrz9x6LXSbNSMbkVmF706-YPSymFnPxI2IWH3dGqZKK42ztZgxD0QXAPn29EI-_mAm-wVYSOGX0IN_5S6mhrE3zHEEep0SCCbZOyzS_St0k7LeKKfcIi5MtCgpbtgVMQ" }


type QuestionSchema = {
    pubKey: string,
    pvtKeyHint: string
} & RJSFSchema
export default function SurveyView() {
    const [openDialog, setOpenDialog] = useState(false)
    const [formData, setFormData] = useState({})
    const [jsonSchema, setJsonSchema] = useState<{ schema: QuestionSchema, uiSchema: any }>(
        { schema: { title: "Please upload JSON", type: "object", properties: {} }, uiSchema: {} })

    const params = useParams();
    const navigate = useNavigate();
    const selSec = typeof params.section == "undefined" ? 0 : parseInt(params.section)
    const selQ = typeof params.question == "undefined" ? 0 : parseInt(params.question)

    useEffect(() => {
        // const schemaStr = window.localStorage.getItem("savedSurvey");
        // const schema = transformSurveyToJsonSchema(JSON.parse(schemaStr || "{}"))
        // console.log("schema", schema)
        // const uiSchema = getUISchemaFromCustomJSONSchema(schema)
        // console.log("schema-ui", uiSchema)

        // setJsonSchema({ schema, uiSchema })
    }, [])

    const handleDialogClose = (e: React.MouseEvent, json: RJSFSchema) => {
        setOpenDialog(!openDialog)
        if (e) { return }
        setJsonSchema({ schema: json, uiSchema: getUISchemaFromCustomJSONSchema(json) })
    }
    return <>
        {openDialog && <UploadSurveyQuestionsDialog open={openDialog} handleClose={handleDialogClose} />}

        {<Button onClick={() => { setOpenDialog(!openDialog) }} variant="outlined" >Upload Questionnaire JSON</Button>}
        <Box sx={{ display: "flex", mt: 2, flexWrap: "wrap" }}>
            <QuestionsTree
                treeViewObj={schemaToTreeView(jsonSchema.schema)}
                selSec={selSec}
                selQ={selQ}
                handleClick={(section: number, question: number) => { navigate(`/survey/${section}/${question}`); }}
            />
            <Box sx={{ flexGrow: 1 }}>
                <Form

                    schema={jsonSchema.schema}
                    validator={validator}
                    fields={{ NullField: HTMLViewerWidget }}
                    uiSchema={jsonSchema.uiSchema}

                    widgets={{ "Multi-choice-with-other": MultiChoiceWithOtherWidget }}
                    templates={{ ObjectFieldTemplate, ErrorListTemplate }}
                    onChange={(form) => {

                        console.log("onchange", form.formData)
                        setFormData(form.formData)
                    }}
                    formData={formData}
                    onSubmit={async (form) => {
                        const aesKey = await getNewKey()
                        const aesKeyStr = await exportKey(aesKey)
                        const pubKey = await importPubKey(jsonSchema.schema.pubKey)
                        const encAesKey = await rsaEncryptMessage(pubKey, aesKeyStr)
                        const encFormData = await encryptMessage(aesKey, form.formData)
                        const result = JSON.stringify({ encAesKey, encFormData })
                        console.log("formData", result);
                        if (!navigator.clipboard) {
                            downloadFile("survey-result.json", result)
                            return;
                        }
                        navigator.clipboard.writeText(result).then(function () {
                            alert("Ctrl+v to paste the content in mail or chat")
                        }, function (err) {
                            console.error('Async: Could not copy text: ', err);
                            downloadFile("survey-result.json", result)
                        });
                        // insertSurvey(db,{usernameid: `user-${Math.random()}`, ...form.formData})
                        // console.log("submit", JSON.stringify(transformSurveyToJsonSchema(form.formData)))
                    }}
                    showErrorList="bottom"
                >
                    <>
                        {Object.keys(jsonSchema.schema.properties).length > 0 && <Button type="submit" >Send survey</Button>}
                    </>
                </Form>
            </Box>
        </Box>
    </>
}

function ErrorListTemplate(props: ErrorListProps) {
    console.log("ErrorListProps", props)
    const { errors, schema } = props;
    const getErrorPathMessage= (property: string)=>{
        const pathArr = property?.substring(1)?.split(".")
        if(pathArr && pathArr.length){
            const qNo = parseInt(pathArr[1].replace("question",""))
            const sectionTitle = schema.properties[pathArr[0]].title
            const questionTitle = `Question ${qNo+1}:`
            return `${sectionTitle} / ${questionTitle} `
        }
        return ""
    }
    return (
        <div>
            <Alert severity="error">
                <AlertTitle>Error List</AlertTitle>
                <ul>
                    {errors.map(error => (
                        <li key={error.stack}>
                          {getErrorPathMessage(error.property as string)}  {error.message}
                        </li>
                    ))}
                </ul>
            </Alert>


        </div>
    );
}


function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
    const params = useParams();
    const navigate = useNavigate();
    const section = typeof params.section == "undefined" ? "0" : params.section
    const question = typeof params.question == "undefined" ? "0" : params.question

    let totalQuestionInSection = 999;

    const currentPaths = props.idSchema.$id.split("_")
    console.log("ObjectFieldTemplateProps", props);
    if (currentPaths.length == 2) {
        const sectionNo = currentPaths[1].replace("section", "")
        if (section != sectionNo) {
            return null
        }

    }

    if (currentPaths.length > 2) {
        const sectionNo = currentPaths[1].replace("section", "")
        const questionNo = currentPaths[2].replace("question", "")
        totalQuestionInSection = Object.keys(props.registry.rootSchema.properties["section" + section].properties).length

        // console.log("ObjectFieldTemplateProps s q", section, sectionNo, question, questionNo)
        if (sectionNo != section || question != questionNo)
            return null
    }

    const handleNavigateNext = () => {
        const sectionQuestionsLen = Object.keys(props.registry.rootSchema.properties["section" + section].properties).length
        console.log("props.schema.properties.length", sectionQuestionsLen, question)
        if (sectionQuestionsLen - 1 == parseInt(question)) {
            navigate(`/survey/${parseInt(section) + 1}/0`);
            return
        }
        navigate(`/survey/${section}/${parseInt(question) + 1}`);
    }
    const handleNavigatePrev = () => {
        if (question == "0" && section != "0") {
            const sectionQuestionsLen = Object.keys(props.registry.rootSchema.properties["section" + (parseInt(section) - 1)].properties).length

            navigate(`/survey/${parseInt(section) - 1}/${sectionQuestionsLen - 1}`);
            return
        }
        navigate(`/survey/${section}/${parseInt(question) - 1}`);
    }
    const totalSections = Object.keys(props.registry.rootSchema.properties).length

    return (
        <div>
            {props.title && <>
                <Typography sx={{ fontSize: `${2 / currentPaths.length}rem` }}>{props.title}</Typography>
                <Divider />
            </>}

            {props.description}
            {props.properties.map((element, idx) => {
                if (element.name.startsWith("section")) {
                    const schemaSectionNo = element.name.replace("section", "")
                    if (schemaSectionNo != section) {
                        return <div key={section} style={{ display: "none" }}>{element.content}</div>
                    }
                }
                if (element.name.startsWith("question")) {
                    const schemaQuestionNo = element.name.replace("question", "")
                    if (schemaQuestionNo != question) {
                        return <div key={question} style={{ display: "none" }}>{element.content}</div>
                    }
                }
                return <div key={element.name} className="property-wrapper">{element.content}</div>
            })
            }
            <Box sx={{ textAlign: "right", pt: 3 }}>
                {currentPaths.length > 2 && (section != "0" || question != "0") && <Button onClick={handleNavigatePrev} >Previous</Button>}
                {currentPaths.length > 2 && !(parseInt(section) == totalSections - 1 && totalQuestionInSection - 1 == parseInt(question)) && <Button onClick={handleNavigateNext} >Next</Button>}
            </Box>
        </div>
    );
}