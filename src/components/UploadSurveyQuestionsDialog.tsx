import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, Input, InputLabel, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { RJSFSchema } from "@rjsf/utils";

type AddSurveyQuestionsDialogProps = {
    open: boolean,
    handleClose: (e: any, data: RJSFSchema) => void
}
type QuestionnaireFormElements = HTMLFormElement & {
    elements: CustomFormElements
}

type CustomFormElements = HTMLFormControlsCollection & {
    surveyName: HTMLInputElement,
    questionJson: HTMLInputElement,
    pvtKey: HTMLInputElement,
}
export default function UploadSurveyQuestionsDialog({ open, handleClose }: AddSurveyQuestionsDialogProps) {
    const [showErrorAlert, setShowErrorAlert] = useState(false)

    const handleData = (data: string) =>{
        try {
            handleClose(null, JSON.parse(data))
        } catch (err) {
            console.error(err)
            setShowErrorAlert(true)
        }
    }
    const onFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            return
        }
        let file = event.target.files[0];
        console.log(file);

        if (file) {
            let reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function () {
                console.log(reader.result);
                handleData(reader.result as string);
            };

            reader.onerror = function () {
                console.log(reader.error);
                setShowErrorAlert(true)
            };
        }
    }
    return <><Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Questionnaire JSON</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
            <DialogContentText>
                Upload Questionnaire JSON file or paste the JSON content
                {showErrorAlert && <Alert severity="error">Error in JSON input</Alert>}
            </DialogContentText>
            <Box sx={{ m: 2 }}>
                <IconButton color="primary" aria-label="upload picture" component="label">
                    <input onChange={onFileUpload} hidden accept="application/json" type="file" />
                    <FileUploadIcon />
                    <Typography>Upload JSON file</Typography>
                </IconButton>
            </Box>

            <Typography>Paste the JSON  content</Typography>
            <TextField multiline onBlur={(e)=>{handleData(e.target.value)}} rows={6} sx={{width: "30em"}} ></TextField>



        </DialogContent>
        <DialogActions>
            <Button onClick={(e) => handleClose(e, null)}>OK</Button>
            <Button onClick={(e) => handleClose(e, null)}>Cancel</Button>

        </DialogActions>
    </Dialog></>

}