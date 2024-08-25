import {promises as fs} from 'fs';
import { Logger } from './logger';


export class Filelist {
    files: string[];
    incdir: string[];
    defines: string[];
    unknownsFound: boolean;
    commentsFound: boolean;

    constructor() {
        this.files = [];
        this.incdir = [];
        this.defines = [];
        this.unknownsFound = false;
        this.commentsFound = false;
    }

    extend(filelist: Filelist) {
        this.files.push(...filelist.files);
        this.incdir.push(...filelist.incdir);
        this.defines.push(...filelist.defines);
        this.unknownsFound = filelist.unknownsFound || this.unknownsFound;
        this.commentsFound = filelist.commentsFound || this.commentsFound;
    }

    async parseFile(filepath: string) {
        let filedata = await fs.readFile(filepath, 'utf-8');
        let lines = filedata.split('\n');
        for(let line of lines) {
            let listLine = new FilelistLine();
            listLine.parse(line);
            let nestedFileList;
            switch(listLine.type) {
                case FilelistLineType.comment:
                    this.commentsFound = true;
                    break;
                case FilelistLineType.unknown:
                    this.unknownsFound = true;
                    break;
                case FilelistLineType.define:
                case FilelistLineType.empty:
                    break;
                case FilelistLineType.file:
                    this.files.push(listLine.path);
                    break;
                case FilelistLineType.incdir:
                    this.incdir.push(listLine.path);
                    break;
                case FilelistLineType.filelist:
                    nestedFileList = new Filelist();
                    await nestedFileList.parseFile(listLine.path);
                    this.extend(nestedFileList);
                    break;
            }
        }
    }
}


export enum FilelistLineType {
    filelist,
    file,
    incdir,
    define,
    comment,
    unknown,
    empty
}

export class FilelistLine {
    type: FilelistLineType;
    // stores path for filelist, file and incdir
    path: string;

    parse(line: string) {
        line = line.trim();
        if(line.startsWith('-f ')) {
            this.type = FilelistLineType.filelist;
            this.path = line.slice(3).trim();
        }
        else if(line.startsWith('+incdir+')) {
            this.type = FilelistLineType.incdir;
            this.path = line.slice(8).trim();
        }
        else if(line.startsWith('+define+')) {
            this.type = FilelistLineType.define;
            this.path = line.slice(8).trim();
        }
        else if(line.startsWith('//')) {
            this.type = FilelistLineType.comment;
        }
        else if(line === '') {
            this.type = FilelistLineType.empty;
        }
        else {
            this.type = FilelistLineType.file;
            this.path = line;
        }
    }
}