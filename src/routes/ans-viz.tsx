import { Box, Divider, Typography } from "@mui/material"
import { createMarkup } from "../utils/general"
import { deepPurple } from '@mui/material/colors';


export default function AnsVizContainer() {
    const data: SurveyResultData = {
        question: "<h3>What is your preferred Javascript framework</h3>",
        answers: [

            { answer: "AngularJs", count: 300 },
            { answer: "Vue", count: 100 },
            { answer: "ReactJS", count: 500 },
            { answer: "Svelte", count: 5 },

        ]
    }
    return <AnsViz data={data} />
}

export type SurveyResultData = {
    question: string,
    answers: SurveyAnswerCount[]

}

export type SurveyAnswerCount = {
    answer: string,
    count: number
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
                    justifyContent: "right"
                }}>
                    <Typography>{row.answer}</Typography></Box>
                <Box sx={{ p: 1 }}>
                    <Box sx={{
                        //@ts-ignore
                        backgroundColor: deepPurple[(Math.abs((idx % 4) + 4) * 100)],
                        width: `${(row.count / totalCountSum) * 100}%`,
                        p: "5px"
                    }}>

                    </Box>
                    <Typography> {row.count.toString()}</Typography>
                </Box>
            </>)}
        </Box>

    </Box>
}