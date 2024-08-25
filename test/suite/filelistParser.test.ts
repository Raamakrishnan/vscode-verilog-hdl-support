import {FilelistLine, FilelistLineType, Filelist} from "../../src/filelistParser";
import * as assert from 'assert';
import * as path from 'path';
import {promises as fs} from 'fs';
import { suiteTeardown } from "mocha";

suite('Filelist LineParser tests', () => {
    test('Line Parser filelist', () => {
        var line1 = new FilelistLine();
        line1.parse(' -f /ascac/aca/sasc.vd  ');
        assert(line1.type === FilelistLineType.filelist);
        assert(line1.path === '/ascac/aca/sasc.vd');
    });
    test('Line Parser file', () => {
        var line1 = new FilelistLine();
        line1.parse('  /ascac/aca/sasc/acac/dfbd.f3  ');
        assert(line1.type === FilelistLineType.file);
        assert(line1.path === '/ascac/aca/sasc/acac/dfbd.f3');
    });
    test('Line Parser incdir', () => {
        var line1 = new FilelistLine();
        line1.parse(' +incdir+/ascac/aca/sasc/acac/dfbd.f3   ');
        assert(line1.type === FilelistLineType.incdir);
        assert(line1.path === '/ascac/aca/sasc/acac/dfbd.f3');
    });
    test('Line Parser comment', () => {
        var line1 = new FilelistLine();
        line1.parse('  //   +incdir+/ascac/aca/sasc/acac/dfbd.f3  ');
        assert(line1.type === FilelistLineType.comment);
    });
    test('Line Parser empty', () => {
        var line1 = new FilelistLine();
        line1.parse('    ');
        assert(line1.type === FilelistLineType.empty);
    });
});


suite('Filelist FileParser tests', () => {
    const testFilepath1 = path.join(__dirname, 'test1.f');
    const testFilepath2 = path.join(__dirname, 'test2.f');
    const testDotFData1 = 
`  //  sample
  /ascac/aca/sasc/acac/dfbd.f3 
    +incdir+/ascac/aca/sasc/   
-f   ${testFilepath2}
`;

const testDotFData2 = 
`  /lnklkm/lknlkn/
// aadc 
`;

    suiteSetup(async () => {
        await fs.writeFile(testFilepath1, testDotFData1);
        await fs.writeFile(testFilepath2, testDotFData2);
    });

    test('File read test', async () => {
        var filelist = new Filelist();
        await filelist.parseFile(testFilepath1);
        assert(filelist.commentsFound === true);
        assert(filelist.files.length === 2);
        assert(filelist.files[0] === '/ascac/aca/sasc/acac/dfbd.f3');
        assert(filelist.files[1] === '/lnklkm/lknlkn/');
        assert(filelist.incdir.length === 1);
        assert(filelist.incdir[0] === '/ascac/aca/sasc/');
    });

    suiteTeardown(async () => {
        fs.unlink(testFilepath1);
        fs.unlink(testFilepath2);
    });

});