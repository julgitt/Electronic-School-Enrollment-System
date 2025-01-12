import {
    adminService,
    applicationService,
    candidateService, gradeService,
    profileService,
    schoolService,
    subjectService,
    userService
} from "../dependencyContainer";
import {UserRequest} from "../dto/user/userRequest";
import {DataConflictError} from "../errors/dataConflictError";
import {CandidateRequest} from "../dto/candidate/candidateRequest";
import * as fs from 'fs';
import {School} from "../dto/school/school";
import {ProfileRequest} from "../dto/profile/profileRequest";
import {ProfileCriteria} from "../dto/criteriaByProfile";
import {ProfileCriteriaType} from "../models/profileCriteriaEntity";
import {ApplicationRequest} from "../dto/application/applicationRequest";
import {GradeRequest} from "../dto/grade/gradeRequest";
import {GradeType} from "../dto/grade/gradeType";
import csvParser from 'csv-parser';
import {Subject} from "../dto/subject";
import * as path from "node:path";

let userId = 0;
let schoolId = 0;

export const runSimulation = async () => {
    const profileCapacity = 300
    const p = 300
    for (let c = 1; c <= 100000; c *= 10) {
        //const p = Math.floor(c / profileCapacity) + 6;
        let time = 0;
        console.log(`Running simulation for ${c} candidates and ${p} profiles`);
        time = await runEnrollment(c, 6, profileCapacity, p);

        fs.appendFile(
            'executionTime.txt',
            time.toString() + ' ' + c.toString() + ' ' + p.toString() + '\n',
            (err) => {
                if(err) console.log("error:" + err)
            });
    }
    console.log("end")
}

const runEnrollment = async (
    candidatesNumber: number,
    applicationsPerCandidate: number,
    profilesCapacity: number,
    profilesNumber: number
) => {
    let time = 0;

    try {
        await initialize(candidatesNumber, applicationsPerCandidate, profilesCapacity, profilesNumber);
        const startTime = performance.now();
        await adminService.processProfileEnrollments();
        const endTime = performance.now();
        time = endTime - startTime;
    } catch (e) {
        throw e
    } finally {
        await userService.deleteUser(userId);
        await schoolService.deleteSchool(schoolId);
    }
    return time
}

const initialize = async (
    numCandidates: number,
    numApplicationsPerCandidate: number,
    profileCapacity: number,
    numProfiles: number,
) => {
    userId = await initializeUser();
    const subjects = (await subjectService.getAllSubjects());
    const subjectIds = subjects.map(s => s.id);

    const profileIds = await initializeProfiles(numProfiles, profileCapacity, subjectIds);

    let candidateId;
    const candidates: CandidateRequest[] = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(path.join(__dirname, 'candidates.csv'))
            .pipe(csvParser())
            .on('data', (data: CandidateRequest) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });

    for (let i = 0; i < numCandidates; i++) {
        const candidate = candidates[i];

        try {
            candidateId = (await candidateService.register(userId, candidate)).id;
            await initializeGrades(candidateId, subjects);
            await initializeApplications(candidateId, numApplicationsPerCandidate, profileIds);
        } catch (error) {
            if (error instanceof DataConflictError) console.log(error.message + candidate.pesel);
            else throw error;
        }
    }
    return {userId, schoolId}
}

const initializeUser = async (): Promise<number> => {
    const user: UserRequest = {
        username: "parent",
        email: "parent@parent.com",
        password: "haslohaslo"
    }
    try {
        await userService.register(user);
    } catch (error) {
        if (!(error instanceof DataConflictError)) throw error;
    }
    return (await userService.login("parent", "haslohaslo")).id;
}

const initializeSchool = async (): Promise<number> => {
    const school: School = {
        id: 0,
        name: "TestowaSzkoła",
    }
    return (await schoolService.addSchool(school)).id;

}

const initializeProfiles = async (numberOfProfiles: number, profileCapacity: number, subjectIds: number[]) => {
    schoolId = await initializeSchool();
    const profileIds: number[] = [];

    for (let i = 0; i < numberOfProfiles; i++) {
        const profile: ProfileRequest = {
            id: 0,
            name: generateProfileName(i),
            capacity: profileCapacity,
            criteria: generateCriteria(subjectIds),
        };

        try {
            profileIds.push(await profileService.addProfile(profile, schoolId));

        } catch (error) {
            if (error instanceof DataConflictError) console.log(error.message);
            else throw error;
        }
    }
    return profileIds;
}

const initializeApplications = async (
    candidateId: number,
    numApplicationsPerCandidate: number,
    profileIds: number[]
) => {
    const applications: ApplicationRequest[] = [];
    const shuffledIds = [...profileIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numApplicationsPerCandidate; i++) {
        const application: ApplicationRequest = {
            profileId: shuffledIds[i],
            priority: i + 1
        }
        applications.push(application);
    }
    await applicationService.addApplication(applications, candidateId);
}

const initializeGrades = async (
    candidateId: number,
    subjects: Subject[]
) => {
    const grades: GradeRequest[] = [];
    for (let i = 0; i < subjects.length; i++) {
        const subjectId = subjects[i].id;
        const isExam = subjects[i].isExamSubject;

        const grade: GradeRequest = {
            grade: Math.floor(Math.random() * 5) + 1,
            subjectId,
            type: GradeType.Certificate
        }
        grades.push(grade);

        if (!isExam) continue;

        const gradeExam: GradeRequest = {
            grade: Math.floor(Math.random() * 100),
            subjectId,
            type: GradeType.Exam
        }
        grades.push(gradeExam);
    }
    await gradeService.submitGrades(grades, candidateId);
}

const generateProfileName = (index: number): string => {
    let result = '';
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const base = alphabet.length;

    while (index >= 0) {
        result = alphabet[index % base] + result;
        index = Math.floor(index / base) - 1;
    }

    return result;
};

const generateCriteria = (subjectIds: number[]): ProfileCriteria[] => {
    const criteria = [];

    const shuffledSubjects = [...subjectIds].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
        criteria.push({
            id: 0,
            profileId: 0,
            subjectId: shuffledSubjects[i],
            type: ProfileCriteriaType.Mandatory
        });
    }
    for (let i = 3; i < 5; i++) {
        criteria.push({
            id: 0,
            profileId: 0,
            subjectId: shuffledSubjects[i],
            type: ProfileCriteriaType.Alternative
        });
    }
    return criteria;
};