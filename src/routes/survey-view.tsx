import { useEffect, useState } from "react";
import { getUISchemaFromCustomJSONSchema, transformSurveyToJsonSchema } from "../utils/transform-util";
import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { ArrayFieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import { Box, Button, Divider, Typography } from "@mui/material";
import HTMLViewerWidget from "../components/HTMLViewerWidget";
import MultiChoiceWithOtherWidget from "../components/MultiChoiceWithOtherWidget";
import { useNavigate, useParams } from 'react-router-dom';



export default function SurveyView() {
    const [jsonSchema, setJsonSchema] = useState({ schema: {}, uiSchema: {} })
    useEffect(() => {
        const schemaStr = window.localStorage.getItem("savedSurvey");
        const schema = transformSurveyToJsonSchema(JSON.parse(schemaStr || "{}"))
        console.log("schema", schema)
        const uiSchema = getUISchemaFromCustomJSONSchema(schema)
        console.log("schema-ui", uiSchema)

        setJsonSchema({ schema, uiSchema })
    }, [])
    return <>
        <Form
            schema={jsonSchema.schema}
            validator={validator}
            fields={{ NullField: HTMLViewerWidget }}
            uiSchema={jsonSchema.uiSchema}

            widgets={{ "Multi-choice-with-other": MultiChoiceWithOtherWidget }}
            templates={{ ObjectFieldTemplate }}
            onSubmit={(form) => {
                console.log("formData", form.formData);
                // window.localStorage.setItem("savedSurvey", JSON.stringify(form.formData))
                // console.log("submit", JSON.stringify(transformSurveyToJsonSchema(form.formData)))
            }}
        >
            <>
                <Button type="submit" >Send survey</Button>
            </>
        </Form>
    </>
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

        console.log("ObjectFieldTemplateProps s q", section, sectionNo, question, questionNo)
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
            {props.properties.map(element => {
                console.log("pw-ele",element);
                if(element.name.startsWith("section")){
                    const schemaSectionNo = element.name.replace("section","")
                    if(schemaSectionNo != section){
                        return <div style={{display:"none"}}>{element.content}</div>
                    }
                }
                if(element.name.startsWith("question")){
                    const schemaQuestionNo = element.name.replace("question","")
                    if(schemaQuestionNo != question){
                        return <div style={{display:"none"}}>{element.content}</div>
                    }
                }
                return <div className="property-wrapper">{element.content}</div>
            })
            }
            <Box sx={{ textAlign: "right", pt: 3 }}>
                {currentPaths.length > 2 && (section != "0" || question != "0") && <Button onClick={handleNavigatePrev} >Previous</Button>}
                {currentPaths.length > 2 && !(parseInt(section) == totalSections-1 && totalQuestionInSection-1 == parseInt(question) ) && <Button onClick={handleNavigateNext} >Next</Button>}
            </Box>
        </div>
    );
}