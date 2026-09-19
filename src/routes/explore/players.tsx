import {createFileRoute} from '@tanstack/react-router';
import {PlayersDirectory} from './$type/$slug';

export const Route=createFileRoute('/explore/players')({component:PlayersDirectory});
