import { Box, Button, dialogActionsClasses, Divider, FormControl, FormControlLabel, FormHelperText, Input, InputLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material"
import { createMarkup } from "../utils/general"
import { deepPurple } from '@mui/material/colors';
import AddQuestionnaireDialog from "../components/AddQuestionnaireDialog";
import { useEffect, useState } from "react";
import { Widgets } from "@rjsf/mui";
import { createStoreIfNotExists, generalNameToStoreName, getAllIndexedAnswers, insertSurvey } from "../utils/indexdb";
import AddSurveyResultDialog from "../components/AddSurveyResultDialog";
import {
    decryptMessage, encryptMessage,
    exportKey, importKey, getNewKey
} from "../utils/aes-encryption"
import {
    decryptMessage as rsaDecryptMessage, encryptMessage as rsaEncryptMessage,
    getNewKey as getNewRsaKey,
    exportPubKey, exportPvtKey, importPubKey, importPvtKey
} from "../utils/ppk-encryption"
import { getSchemaValuesFromSchema } from "../utils/transform-util";

type AddQuestionnaireProps = {
    name: string,
    pvtKey: any,
    questionnaireData: any

}

export default function AnsVizContainer() {
    const [data, setData] = useState<SurveyResultData | undefined>(undefined)
    const [openQDialog, setOpenQDialog] = useState(false)
    const [openResultDialog, setOpenResultDialog] = useState(false)
    const [selectedSection, setSelectedSection] = useState("")
    const [selectedQno, setSelectedQno] = useState("")
    const [questionData, setQuestionData] = useState<AddQuestionnaireProps>({ name: "", pvtKey: {}, questionnaireData: {} })

    useEffect(() => {
        let localQuestionData = window.localStorage.getItem("questionData")
        if (localQuestionData) {
            setQuestionData(JSON.parse(localQuestionData))
        }
    }, [])



    const dialogClose = (data: AddQuestionnaireProps | undefined) => {
        if (!data) {
            setOpenQDialog(!openQDialog)
            return
        }
        try {

            data.questionnaireData = getSchemaValuesFromSchema(data.questionnaireData)
            console.log("data", data)
            setOpenQDialog(!openQDialog)
            window.localStorage.setItem("questionData", JSON.stringify(data))
            setQuestionData(data)
            createStoreIfNotExists(data.name, data.questionnaireData.sections)
        } catch (err) {
            console.error(err)
        }
    }

    const resultDialogClose = async (data: any) => {
        console.log("resultDialogClose", data)
        if (data.type) {
            setOpenResultDialog(false)
            return
        }
        try {
            const { name, resultJSON: { encAesKey, encFormData } } = data;
            console.log("questionData.pvtKey", questionData.pvtKey)
            const pvtKey = await importPvtKey(JSON.stringify(questionData.pvtKey))

            const decAesKey = await rsaDecryptMessage(pvtKey, encAesKey)
            const aesKey = await importKey(decAesKey)
            let decData = await decryptMessage(aesKey, encFormData)
            console.log("decData", decData, name)
            insertSurvey({ usernameid: name, ...decData }, generalNameToStoreName(questionData.name))
            setOpenResultDialog(false)
        } catch (err) {
            console.error(err)
        }
    }





    useEffect(() => {
        const getData = async () => {
            const data: SurveyResultData = {
                question: "",
                answers: [

                    // { answer: "AngularJs", count: 300 },
                    // { answer: "Vue", count: 100 },
                    // { answer: "ReactJS", count: 500 },
                    // { answer: "Svelte", count: 5 },

                ]
            }
            if (selectedQno && selectedSection && questionData?.questionnaireData?.sections[selectedSection]?.questions[selectedQno]) {
                data.question = selectedSection && questionData?.questionnaireData?.sections[selectedSection]?.questions[selectedQno]?.question
                let options = selectedSection && questionData?.questionnaireData?.sections[selectedSection]?.questions[selectedQno]?.options
                if (options) {
                    let prevOptions = data.answers.map(ans => ans.answer)
                    options.forEach((opt: string) => {
                        if (!prevOptions.includes(opt)) {
                            data.answers.push({ answer: opt, count: 0, users: [] })
                        }
                    })
                }
                let indexName = `section${selectedSection}.question${selectedQno}.a`
                let result: any[] = await getAllIndexedAnswers(generalNameToStoreName(questionData.name), indexName) as any[]
                console.log("indexedResult", result)
                result.forEach(res => {
                    let answers = res["section" + selectedSection]["question" + selectedQno].a
                    if (Array.isArray(answers)) {
                        answers.forEach((ans: string) => {
                            let found = data.answers.find(d => d.answer == ans)
                            if (found) {
                                found.count += 1
                                found.users.push(res.usernameid)
                            } else {
                                data.answers.push({ answer: ans, count: 1, users: [res.usernameid] })
                            }

                        })
                    } else {
                        let found = data.answers.find(d => d.answer == answers)
                        if (found) {
                            found.count += 1
                            found.users.push(res.usernameid)
                        } else {
                            data.answers.push({ answer: answers, count: 1, users: [res.usernameid] })
                        }
                    }
                })
                setData(data)
            }

        }
        getData()

    }, [selectedSection, selectedQno])

    return <>
        <Button onClick={() => setOpenQDialog(!openQDialog)}>Add Questionnaire</Button>
        {questionData.name && <Button onClick={() => setOpenResultDialog(!openResultDialog)}>Add Survey Result</Button>}
        <Divider />
        <Box>
            <Typography>Name: {questionData.name}</Typography>
            <Typography>Sections: </Typography>
            <RadioGroup row name="selectedSection" value={selectedSection}
                onChange={(event) => { setSelectedSection((event.target as HTMLInputElement).value); }} >
                {questionData?.questionnaireData?.sections?.map((section: any, idx: number) => <FormControlLabel value={idx} control={<Radio />} label={section.name} />)}
            </RadioGroup>
            <Typography>Questions: </Typography>
            <RadioGroup row name="selectedQno" value={selectedQno}
                onChange={(event) => { setSelectedQno((event.target as HTMLInputElement).value); }} >
                {selectedSection && questionData?.questionnaireData?.sections[selectedSection]?.questions
                    .map((question: any, idx: number) => <FormControlLabel value={idx} control={<Radio />} label={`Question ${idx + 1}`} />)}


            </RadioGroup>

        </Box>
        {openQDialog && <AddQuestionnaireDialog open={openQDialog} handleClose={dialogClose} />}
        {openResultDialog && <AddSurveyResultDialog open={openResultDialog} handleClose={resultDialogClose} />}

        <Divider />
        {data && <AnsViz data={data} />}
    </>
}

export type SurveyResultData = {
    question: string,
    answers: SurveyAnswerCount[],

}

export type SurveyAnswerCount = {
    answer: string,
    count: number,
    users: string[]
}

export function AnsViz({ data }: { data: SurveyResultData }) {
    const maxLengthOfAnswers = data.answers.reduce((a, c) => c.answer.length > a ? c.answer.length : a, 0)
    const totalCountSum = data.answers.reduce((a, c) => a + c.count, 0)
    const firstGridFraction = maxLengthOfAnswers > 100 ? "3fr" : "1fr"
    return <Box>
        <Box sx={{ p: 1 }}>
            <Typography>
                <div dangerouslySetInnerHTML={createMarkup(data.question)} />
            </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", width: "100%", gridTemplateColumns: `${firstGridFraction} 2fr` }}>
            {data.answers.map((row, idx) => <>
                <Box sx={{
                    pr: 1, borderRight: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "right",
                    pb: 2,
                    pt:1
                }}>
                    <Typography  >{row.answer}</Typography></Box>
                <Box sx={{ p: 1 }} title={row.users.join(", ")}>
                    <Box sx={{
                        //@ts-ignore
                        backgroundColor: deepPurple[(Math.abs((idx % 4) + 4) * 100)],
                        width: `${(row.count / (totalCountSum || 1)) * 100}%`,
                        pt: ((row.count / (totalCountSum || 1)) * 100) ? 1 : 0
                    }}>

                    </Box>
                    <Typography> {row.count.toString()} </Typography>
                </Box>
            </>)}
        </Box>

    </Box>
}