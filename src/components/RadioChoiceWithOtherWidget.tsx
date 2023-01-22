import { Box, Radio, RadioGroup, TextField } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { WidgetProps } from '@rjsf/utils';
import React from 'react';


export default function RadioChoiceWithOtherWidget(props: WidgetProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        props.onChange(event.target.value)

    };
    let otherValue = props.schema.items?.suggestions.includes(props.value) ? "" : props.value
    const isWithOther = props.uiSchema && props.uiSchema['ui:widget'] === 'Single-choice-with-other'
    return (
        <FormGroup>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                name={props.title}
                onChange={handleChange}

            >
                {props.schema.items.suggestions?.map((it: string) => {
                    return <FormControlLabel key={it} value={it} control={<Radio checked={props.value == it} />} label={it} />
                })}
                {isWithOther && <Box sx={{ display: "flex", mb: 1 }} key={`othersBox`}>
                    <TextField sx={{ flexGrow: 1 }} key={`others`} placeholder='Others' name={`others`} onChange={handleChange} value={otherValue} ></TextField>
                </Box>}

            </RadioGroup>
            {/* <Box sx={{ display: "flex" }} key={`othersBox-${state.otherSelections.length}`}>
                <TextField placeholder='Others' name={`others-${state.otherSelections.length}`} key={`others-${state.otherSelections.length}`} onChange={handleChange}  ></TextField>
            </Box> */}
        </FormGroup>
    );
}



