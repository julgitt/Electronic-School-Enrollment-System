import {body} from 'express-validator';

export const applicationValidator = [
    body()
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
