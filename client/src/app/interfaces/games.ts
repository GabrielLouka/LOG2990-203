import { Classements } from './classements';
export interface Games {
    description: string;
    image: string;
    difficulty: string;
    classements: Classements[];
}
