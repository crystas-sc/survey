
export function transformSurveyToJsonSchema(surveyJSON: any) {
    const schemaJson = {
        title: surveyJSON.title,
        type: "object",
        properties: {

        }
    }

    schemaJson.properties = surveyJSON.sections.map((section: any) => {
        return {
            title: section.name,
            type: "object",
            properties: section.questions.map((question: any, index: Number) => {
                return {
                    type: "object",
                    title: "",
                    properties: {
                        "q": {
                            type: "null",
                            uiWidget: "HTMLViewer",
                            title: question.question
                        },
                        "a": getJsonSchemaFromComponentType(question)
                    },
                    




                }
            }).reduce((a: any, c: any, index: Number) => {
                a[`question${index}`] = c
                return a
            }, {})
        }
    }).reduce((a: any, c: any, index: Number) => {
        a[`section${index}`] = c
        return a
    }, {})

    return schemaJson;


}

export function getJsonSchemaFromComponentType(question: any) {
    switch (question.component) {
        case "Multi-choice-with-other":
            
            return { type: "array", title:"", uiWidget: question.component, minItems:1, items: { type: question.type || "string", suggestions: question.options } }

        default:
            return {
                type: question.type || "string",
                title: "",

                enum: question.options
            }
    }
}
export function getJSchemaDependenciesFromComponentType(question: any) {
    switch (question.component) {
        case "Multi-choice-with-other":
            return {
                a:{
                    "anyOf":[{
                        properties:{
                            a:{
                                type:"array",
                                items:{type:"string"}
                            }
                        }
                    }
                       
                    ]
                }
            }

        default:
            return {
                type: question.type || "string",
                title: "",

                enum: question.options
            }
    }
}

export function getUISchemaFromCustomJSONSchema(schemaJson: any) {
    const uiSchema: any = {}
    if (schemaJson.properties) {
        // const keys = Object.keys(schemaJson.properties  )
        const keys = schemaJson.properties
        for (let k in keys) {


            uiSchema[k] = getUISchemaFromCustomJSONSchema(schemaJson.properties[k])
            if (schemaJson.properties[k].uiWidget) {
                uiSchema[k]["ui:widget"] = schemaJson.properties[k].uiWidget
            }
        }
    }
    if (schemaJson.items && schemaJson.items.properties) {
        
        for (let k in schemaJson.items.properties) {
            uiSchema["items"][k] = getUISchemaFromCustomJSONSchema(schemaJson.items.properties[k])
            
        }
    }

    return uiSchema
}
