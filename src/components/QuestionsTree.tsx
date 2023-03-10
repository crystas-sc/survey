import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { TreeViewType } from '../utils/transform-util';

export default function QuestionsTree({ treeViewObj, selSec, selQ, handleClick }:
    { treeViewObj: TreeViewType, selSec: number, selQ: number, handleClick: (section: number, question: number) => void }) {
    console.log("treeViewObj", treeViewObj, selSec, selQ);
    return (
        <TreeView
            aria-label="multi-select"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={[`section${selSec}-question`]}
            selected={`section${selSec}-question${selQ}`}
            sx={{ minHeight: 100, maxHeight: 900, flexShrink: 1, flexBasis: "15rem", pr: 4, mt: "3em" }}
        >
            {treeViewObj?.children && treeViewObj.children?.map((tv, idx) => (
                <TreeItem onClick={() => { handleClick(idx, 0) }} key={tv.label} nodeId={`section${idx}-question`} label={tv.label}>
                    {tv.children?.map((ques, index) => (
                        <TreeItem onClick={() => { handleClick(idx, index) }} key={(tv.label as string) + ques.label} nodeId={`section${idx}-question${index}`} label={ques.label} />
                    ))}
                </TreeItem>
            ))}

        </TreeView>
    );
}