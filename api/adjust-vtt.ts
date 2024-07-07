export default async (req: any, res: any) => {
    try {
        const vttUrl = req.query.vttUrl as string;
        if (vttUrl == null) {
            res.status(400).send('No vttUrl provided.');
            return;
        }
        const offset = Number.parseFloat(req.query.offset ?? 1.5);

        const response = await fetch(vttUrl);
        const vttContent = await response.text();

        const adjustedVtt = adjustVttTimings(vttContent, offset);
        
        res.setHeader('Content-Type', 'text/vtt');
        res.send(adjustedVtt);
    } catch (error) {
        console.error('Error adjusting VTT:', error);
        res.status(500).send('Error adjusting VTT');
    }
};

// Function to adjust VTT timings
function adjustVttTimings(vttContent: string, offset: number): string {
    const lines = vttContent.split('\n');

    const adjustedLines = lines.map(line => {       
        if (line.match(/^(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2})\.(\d{3})/)) {
            return adjustTimestamp(line, offset);
        } else if (line.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/)) {
            return adjustTimestamp(line, offset);
        }
        return line;
    });

    return adjustedLines.join('\n');
}


function adjustTimestamp(timestampLine: string, offset: number): string {   
    const timestampParts = timestampLine.split(' --> ');
    const start = timestampParts[0];
    const end = timestampParts[1];

    const adjustedStart = adjustSingleTime(start, offset);
    const adjustedEnd = adjustSingleTime(end, offset);

    return `${adjustedStart} --> ${adjustedEnd}`;
}

function adjustSingleTime(time: string, offset: number): string {
    const [hhmmss, ms] = time.split('.');
    const splitHhmmss = hhmmss.split(':').map(Number);

    let hours: number, mins: number, secs: number;
    if (splitHhmmss.length == 2) {
        hours = 0;
        [mins, secs] = splitHhmmss;
    } else if (splitHhmmss.length == 3) {
        [hours, mins, secs] = splitHhmmss;
    } else {
        throw Error("How did you end up here? length of " + splitHhmmss.length)
    }
    
    const fullTime = hours*3600 + mins*60 + secs + (Number.parseInt(ms) / 1000);

    const timeDelayed = fullTime + offset;

    const timeDelayedS = Math.floor(timeDelayed);
    const timeDelayedMS = timeDelayed - timeDelayedS;

    const newHours = Math.floor(timeDelayedS / 3600);
    const newMins = Math.floor((timeDelayedS % 3600) / 60);
    const newSecs = Math.floor(timeDelayedS % 60);

    let baseString = (newHours > 0) ? pz(newHours)+":" : "";

    return `${baseString}${pz(newMins)}:${pz(newSecs)}.${pz(Math.round(timeDelayedMS*1000), 3)}`
}

function pz(num: number, pad?: number): string { // padZero
    if (pad === undefined)
        pad = 2;
    return num.toString().padStart(pad, '0');
}