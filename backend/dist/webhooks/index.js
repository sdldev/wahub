import axios from 'axios';
import { env } from '../env';
export const webhookClient = axios.create({
    headers: {
        Authorization: `Bearer ${env.KEY}`,
        Accept: 'application/json',
    },
});
