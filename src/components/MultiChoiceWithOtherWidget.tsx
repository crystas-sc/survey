import React, { useEffect, useRef } from 'react';
import { WidgetProps, FieldProps } from '@rjsf/utils';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Box, IconButton, TextField } from '@mui/material';

function getStateBasedOnSelectionAndSuggestion(selectedValues : string[], suggestionList: string[]){
    let intersection = suggestionList.filter(it => selectedValues.includes(it));
    let suggestedSelectionSet = new Set(intersection)
    let otherSelections = (selectedValues.filter(it => !suggestionList.includes(it) && it))
    return {suggestedSelectionSet,otherSelections}

}

export default function MultiChoiceWithOtherWidget(props: WidgetProps) {
    const initState = getStateBasedOnSelectionAndSuggestion(props.value || [], props.schema.items?.suggestions || []) //(props.value || []).reduce((a: any, c: string) => ({ ...a, [c]: true }), { others: [] })
    const [state, setState] = React.useState(initState);
    useEffect(()=>{
        setState({...state,...initState})
    },[JSON.stringify(props.value)])
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        
        
        if (event.target.name.startsWith("others")) {
            // state.otherSelections.push(event.target.value)
            if(event.target.value.trim())
                state.otherSelections[event.target.name.split("-")[1] as unknown as number] = event.target.value
        } else if(event.target.checked){
            state.suggestedSelectionSet.add(event.target.name)
        } else {
            state.suggestedSelectionSet.delete(event.target.name)
        }
        const newState = {
            ...state,
        }
        setState(newState);
        // const newValue = props.schema.items?.suggestions.filter((it: string) => newState[it]).concat(newState.others)
        const newValue = Array.from(state.suggestedSelectionSet).concat(state.otherSelections)
        // if(newState.others.length){
        //     newValue.push(newState.others)
        // }
        props.onChange(newValue)


    };
    const handleOthersRemove = (index: number) => {
        return () => {
            state.otherSelections.splice(index, 1)
            setState({ ...state });
            props.onChange( Array.from(state.suggestedSelectionSet).concat(state.otherSelections))
        }

    };
    return (
        <FormGroup>
            {props.schema.items.suggestions?.map((it: string) => {
                return <FormControlLabel control={<Checkbox checked={state.suggestedSelectionSet.has(it)} onChange={handleChange} name={it} />} label={it} />
            })}
            {
                state.otherSelections.map((it: string, idx: number) =>
                    <Box sx={{ display: "flex" }}>
                        <TextField sx={{ flexGrow: 1 }} key={`others-${idx}`} placeholder='Others' name={`others-${idx}`} onChange={handleChange} value={it} ></TextField>
                        <IconButton onClick={handleOthersRemove(idx)}>X</IconButton>
                    </Box>
                )
            }
            <TextField placeholder='Others' name={`others-${state.otherSelections.length}`} key={`others-${state.otherSelections.length}`} onChange={handleChange}  ></TextField>
        </FormGroup>
    );
}



