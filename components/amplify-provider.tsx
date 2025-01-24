'use client';

import { PropsWithChildren } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

export function AmplifyProvider({ children }: PropsWithChildren): React.ReactNode {
    return children;
};