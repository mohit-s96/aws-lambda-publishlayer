"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var lambda_1 = __importDefault(require("aws-sdk/clients/lambda"));
var fs_1 = __importDefault(require("fs"));
var child_process_1 = require("child_process");
var checkIfFileExists = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs_1.default.promises.stat(filePath)];
            case 1: return [2 /*return*/, (_a.sent()).isFile()];
            case 2:
                err_1 = _a.sent();
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
var waitTillFilesExists = function (
/**Path of the file to check. */
filePath, 
/**Check for existence every x amount of milliseconds. @default 10 */
checkEvery, 
/**Check until x amount of milliseconds have passed. Reject the promise after that. @default 5000 */
checkUntil) {
    if (checkEvery === void 0) { checkEvery = 100; }
    if (checkUntil === void 0) { checkUntil = 5000; }
    return __awaiter(void 0, void 0, void 0, function () {
        var counter;
        return __generator(this, function (_a) {
            counter = 0 // keep track of how many times the setInterval has run
            ;
            return [2 /*return*/, new Promise(function (res, rej) {
                    var id = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var fileExists;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    counter++;
                                    return [4 /*yield*/, checkIfFileExists(filePath)];
                                case 1:
                                    fileExists = _a.sent();
                                    if (fileExists) {
                                        clearInterval(id);
                                        res(true);
                                    }
                                    else {
                                        if (counter >= checkUntil / checkEvery) {
                                            clearInterval(id);
                                            rej("The file " + filePath + " was not found after " + (checkEvery *
                                                counter) /
                                                1000 + " second(s).");
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }, checkEvery);
                })];
        });
    });
};
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var LayerName, zipFile, repository, repoName, targetPath, lambda, params, response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    LayerName = process.env.AWS_LAYER_NAME;
                    if (!LayerName) {
                        throw new Error('layer name not found.');
                    }
                    zipFile = 'reso-certification-etl.zip';
                    repository = process.env.GITHUB_REPOSITORY;
                    repoName = repository.slice(repository.lastIndexOf('/') + 1);
                    targetPath = "/tmp/" + repoName;
                    core.info('Cloning repository...');
                    child_process_1.execSync("git clone " + process.env.GITHUB_SERVER_URL + "/" + process.env.GITHUB_REPOSITORY, {
                        cwd: '/tmp',
                        stdio: 'inherit',
                    });
                    core.info('Checking out into the target branch...');
                    child_process_1.execSync("git checkout " + process.env.GITHUB_REF_NAME, {
                        cwd: targetPath,
                        stdio: 'inherit',
                    });
                    core.info('Installing NPM packages...');
                    child_process_1.execSync('npm install', {
                        cwd: targetPath,
                        stdio: 'ignore',
                    });
                    // we go up one directory and then zip the reso-certification-etl folder
                    core.info('Moving up one directory...');
                    child_process_1.execSync('cd ..', {
                        cwd: targetPath,
                        stdio: 'ignore',
                    });
                    // zip the reso-certification-etl folder but exclude the .git and .github folders
                    core.info('Zipping the package...');
                    child_process_1.execSync("zip -r " + zipFile + " " + repoName + " -x " + repoName + "/.git*/* " + repoName + "/.github*/*", {
                        cwd: '/tmp',
                        stdio: 'ignore',
                    });
                    return [4 /*yield*/, waitTillFilesExists("/tmp/" + zipFile)
                        // push the built file to AWS lambda layer
                    ];
                case 1:
                    _a.sent();
                    lambda = new lambda_1.default({
                        region: process.env.AWS_REGION,
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    });
                    params = {
                        LayerName: LayerName,
                        Content: {
                            ZipFile: fs_1.default.readFileSync("/tmp/" + zipFile),
                        },
                        CompatibleRuntimes: ['nodejs18.x'],
                        CompatibleArchitectures: ['x86_64'],
                    };
                    core.info('Publishing the layer...');
                    return [4 /*yield*/, lambda.publishLayerVersion(params).promise()];
                case 2:
                    response = _a.sent();
                    core.info('Layer published successfully.');
                    core.info("Layer published successfully. Version: " + response.Version);
                    return [4 /*yield*/, lambda
                            .updateFunctionConfiguration({
                            FunctionName: 'testLambdaLayer',
                            Layers: [
                                "arn:aws:lambda:us-east-2:620872262079:layer:" + LayerName + ":" + response.Version,
                            ],
                        })
                            .promise()];
                case 3:
                    result = _a.sent();
                    core.info("Function updated successfully. Version: " + result.Version);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    core.setFailed(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
run();
