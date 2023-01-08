import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Input, InputLabel } from "@mui/material";
import React from "react";

type AddQuestionnaireDialogProps = {
    open: boolean,
    handleClose: (data: any) => void
}
type QuestionnaireFormElements = HTMLFormElement & {
    elements: CustomFormElements
}

type CustomFormElements = HTMLFormControlsCollection & {
    surveyName: HTMLInputElement,
    questionJson: HTMLInputElement,
    pvtKey: HTMLInputElement,
}
export default function AddQuestionnaireDialog({ open, handleClose }: AddQuestionnaireDialogProps) {
    const jsonValidityCheck= (e: React.ChangeEvent<HTMLInputElement>) =>{
        try {
            JSON.parse(e.target.value)
            e.target.setCustomValidity("")
        } catch (err) {
            e.target.setCustomValidity("Please enter JSON input")
        }
    }
    return <><Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Questionnaire</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Please Add Questionnaire JSON, assoicated Private key and a name hint for the survey
            </DialogContentText>

            <form onSubmit={(e: React.FormEvent<QuestionnaireFormElements>) => {
                e.preventDefault()
                e.stopPropagation()
                console.log(e.currentTarget.elements)
                let name = e.currentTarget.elements.surveyName.value
                let pvtKey = JSON.parse(e.currentTarget.elements.pvtKey.value)
                let questionnaireData = JSON.parse(e.currentTarget.elements.questionJson.value)
                handleClose({ name, pvtKey, questionnaireData })
            }} style={{
                display: "flex", gap: "8px", marginTop: "10px",
                flexWrap: "wrap", rowGap: "10px", justifyContent: "center", flexDirection: "column"
            }}>
                <FormControl>
                    <InputLabel htmlFor="surveyName">Name of survey</InputLabel>
                    <Input id="surveyName" name="surveyName" required />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="pvtKey">Private Key</InputLabel>
                    <Input multiline={true} rows="4" onChange={jsonValidityCheck} id="pvtKey" name="pvtKey" required />
                </FormControl>
                <FormControl>
                    <InputLabel aria-multiline={true} htmlFor="questionJson">Questionnaire JSON</InputLabel>
                    <Input multiline={true} rows="5" onChange={jsonValidityCheck} id="questionJson" name="questionJson" required />
                </FormControl>
                <Button type="submit" variant="contained">Include</Button>
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose(undefined)}>Cancel</Button>

        </DialogActions>
    </Dialog></>

}