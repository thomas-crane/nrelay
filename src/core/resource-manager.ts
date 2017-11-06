import { Log, SeverityLevel } from './../services/logger';
import fs = require('fs');
import path = require('path');

const GROUND_TYPES_REGEX = /<Ground type="(\dx[\da-fA-F]+)"[\s\S]*?(?:<Speed>(\d*\.?\d*)<\/Speed>[\s\S]*?)?<\/Ground>/g;

export class ResourceManager {

    static tileInfo: { [id: number]: number };

    static loadTileInfo(): void {
        this.tileInfo = {};
        const segments = __dirname.split(path.sep);
        segments.pop();
        segments.pop();
        segments.push('resources');
        segments.push('GroundTypes.xml');
        let contents: string;
        try {
            contents = fs.readFileSync(segments.join(path.sep), 'utf8');
        } catch {
            Log('ResourceManager', 'Error reading GroundTypes.xml', SeverityLevel.Warning);
            return;
        }
        let match = GROUND_TYPES_REGEX.exec(contents);
        while (match != null) {
            const type = +match[1];
            let speed = 1;
            try {
                speed = +match[2];
            } catch {}
            this.tileInfo[type] = speed;
            match = GROUND_TYPES_REGEX.exec(contents);
        }
        Log('ResourceManager', 'Loaded GroundTypes.xml', SeverityLevel.Info);
    }
}
