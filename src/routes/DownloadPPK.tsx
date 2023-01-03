import styled from '@emotion/styled'
import { Button, TextField } from '@mui/material'
import { exportPubKey, exportPvtKey, getNewKey } from '../utils/ppk-encryption'


const Container = styled.div`
    height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
`

const CenterDiv = styled.div`
width: 200px;
height: 100px;
`

export default function DowloadPPKView() {
    const handleClick = async (e) => {
        console.log(e)
        const ppk = await getNewKey();
        const pvtKeyStr = await exportPvtKey(ppk.privateKey)
        const pubKeyStr = await exportPubKey(ppk.publicKey)
        const text = `
Below line is the public jwk key:
${pubKeyStr}

------
Below line is the private jwk key:
${pvtKeyStr}
        `
        downloadFile(`keys-${e.target.filename.value}.txt`, text)
    }
    const downloadFile = async (filename: string, text: string) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    return <Container >
        <CenterDiv>
            <form action="#" onSubmit={handleClick}>
                <TextField name="filename" label="Short file name hint" defaultValue={new Date().toLocaleString()} required />
                <br />
                <br />
                <Button type='submit' variant="contained" >Download Key pair</Button>
            </form>
        </CenterDiv>
    </Container>
}