import {IconDefinition as FAIconDefinition} from '@fortawesome/fontawesome-svg-core';

export interface ExtendedIconDefinition extends Omit<FAIconDefinition, 'prefix' | 'iconName'> {
  prefix: string;
  iconName: string;
}

export const faJsonLD: ExtendedIconDefinition = {
  prefix: 'facedar',
  iconName: 'jsonld',
  icon: [
    400,
    400,
    [],
    "e001",
    "m315 246c-4 0-6 0-10 3l-73-122c17-11 28-30 28-51 0-34-28-62-62-62-34 0-60 28-60 62 0 19 9 36 22 47l-86 123c-34 0-61 28-61 62 0 34 27 62 61 62 35 0 62-28 62-62 0-2 0-4 0-4l120 0c0 2 0 4 0 4 0 34 27 62 62 62 34 0 61-28 61-62 0-34-29-62-64-62z m-53 13l-143 0 77-113z m-62-202c11 0 19 8 19 19 0 10-8 19-19 19-10 0-19-11-19-19 0-9 9-19 19-19z m-123 268c-11 0-20-8-20-19 0-10 9-19 20-19 10 0 19 9 19 19 0 11-11 19-19 19z m238 0c-10 0-19-8-19-19 0-10 9-19 19-19 11 0 20 9 20 19 0 11-9 19-20 19z"
  ]
};
