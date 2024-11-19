import { body } from 'express-validator';

function validatePesel(pesel: string): boolean {
    if (!/^\d{11}$/.test(pesel)) {
        return false;
    }

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const digits = pesel.split('').map(Number);
    const checksum = digits
        .slice(0, 10)
        .reduce((acc, digit, index) => acc + digit * weights[index], 0);

    const controlNumber = (10 - (checksum % 10)) % 10;

    return controlNumber === digits[10];
}


export const applicationValidator = [
    body("selections")
        .isArray()
        .bail()
        .custom((selections: { id: number, priority: number }[]) => {
            const priorities = new Set<number>();
            for (const selection of selections) {
                if (selection.priority <= 0 || !Number.isInteger(selection.priority)) {
                    throw new Error('Each priority must be a positive integer greater than 0.');
                }

                if (priorities.has(selection.priority)) {
                    throw new Error(`Each priority must be unique.`);
                }

                priorities.add(selection.priority);
            }
            return true;
        }).withMessage("Priorytety muszą być unikalnymi liczbami całkowitymi większymi od zera"),

];
