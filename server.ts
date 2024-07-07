import express, { Request, Response } from 'express';
import adjustVtt from './api/adjust-vtt';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/adjust-vtt', async (req: Request, res: Response) => {
    adjustVtt(req, res)
});

function pz(num: number): string { // padZero
    return num.toString().padStart(2, '0');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
