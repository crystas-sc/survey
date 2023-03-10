import { RJSFSchema } from "@rjsf/utils"

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
        case "Multi-choice":

            return { type: "array", title: "", uiWidget: question.component, minItems: 1, items: { type: question.type || "string", suggestions: question.options } }
        case "Single-choice-with-other":
        case "Single-choice":

            return { type: "string", title: "", uiWidget: question.component, items: { type: question.type || "string", suggestions: question.options } }

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
                a: {
                    "anyOf": [{
                        properties: {
                            a: {
                                type: "array",
                                items: { type: "string" }
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

export type TreeViewType = {
    label?: string,
    depth: number,
    children?: TreeViewType[]
}
export function schemaToTreeView(schemaJson: RJSFSchema, depth = 0) {
    let res: TreeViewType = { depth }
    if (schemaJson.type == "object") {
        res.label = schemaJson.title
        res.children = []
        let i = 0;
        for (let prop in schemaJson.properties) {

            i++;
            if (prop.startsWith("question")) {
                let resQ: TreeViewType = { depth: depth + 1, label: "Question " + i }
                res.children.push(resQ)
                continue

            }
            res.children.push(schemaToTreeView(schemaJson.properties[prop], depth + 1))
        }
    }
    return res;
}

export function getSchemaValuesFromSchema(schemaJson: RJSFSchema) {
    const res: any = { sections: [] }
    for (let prop in schemaJson.properties) {

        let section: any = {
            name: schemaJson.properties[prop].title,
            questions: []
        }

        res.sections.push(section)
        let sectionProperties = schemaJson.properties[prop].properties
        for (let sProp in sectionProperties) {
            let question: any = {
                question: sectionProperties[sProp].properties.q.title,
                options: sectionProperties[sProp].properties.a.items.suggestions
            }
            section.questions.push(question)
        }


    }
    return res;
}
