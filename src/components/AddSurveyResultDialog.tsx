import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Input, InputLabel } from "@mui/material";
import React from "react";

type AddSurveyResultDialogProps = {
    open: boolean,
    handleClose: (data: any) => void
}
type QuestionnaireFormElements = HTMLFormElement & {
    elements: CustomFormElements
}

type CustomFormElements = HTMLFormControlsCollection & {
    nickName: HTMLInputElement,
    resultJSON: HTMLInputElement,
}
export default function AddSurveyResultDialog({ open, handleClose }: AddSurveyResultDialogProps) {
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
                let name = e.currentTarget.elements.nickName.value
                let resultJSON = JSON.parse(e.currentTarget.elements.resultJSON.value)
                handleClose({ name, resultJSON })
            }} style={{
                display: "flex", gap: "8px", marginTop: "10px",
                flexWrap: "wrap", rowGap: "10px", justifyContent: "center", flexDirection: "column"
            }}>
                <FormControl>
                    <InputLabel htmlFor="nickName">Nick name of User</InputLabel>
                    <Input id="nickName" name="nickName" required />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="resultJSON">Result JSON</InputLabel>
                    <Input multiline={true} rows="4" onChange={jsonValidityCheck} id="resultJSON" name="resultJSON" required />
                </FormControl>
                
                <Button type="submit" variant="contained">Add to DB</Button>
            </form>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => handleClose(undefined)}>Cancel</Button>

        </DialogActions>
    </Dialog></>

}